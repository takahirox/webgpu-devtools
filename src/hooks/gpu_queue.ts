import {
  callCustomFunction,
  callFunction,
  callFunctionAsync
} from "./base";
import { gpuBufferManager } from "../resource_managers/gpu_buffer";
import { gpuCanvasContextManager } from "../resource_managers/gpu_canvas_context";
import { gpuCommandBufferManager } from "../resource_managers/gpu_command_buffer";
import { gpuCommandEncoderManager } from "../resource_managers/gpu_command_encoder";
import { gpuDeviceManager } from "../resource_managers/gpu_device";
import { gpuRenderPassEncoderManager } from "../resource_managers/gpu_render_pass_encoder";
import { gpuTextureManager } from "../resource_managers/gpu_texture";
import { gpuTextureViewManager } from "../resource_managers/gpu_texture_view";
import {
  GPUBuffer_destroy,
  GPUBuffer_getMappedRange,
  GPUBuffer_mapAsync
} from "../hooks/gpu_buffer";
import { GPUCommandEncoder_finish } from "../hooks/gpu_command_encoder";
import {
  GPUDevice_createBuffer,
  GPUDevice_createCommandEncoder
} from "../hooks/gpu_device";
import { getStackTraceAsString } from "../utils/stacktrace";
import { cloneImageSourceAsImageData } from "../utils/image";

export const {
  onSubmittedWorkDone: GPUQueue_onSubmittedWorkDone,
  submit: GPUQueue_submit,
  writeBuffer: GPUQueue_writeBuffer,
  writeTexture: GPUQueue_writeTexture,
  copyExternalImageToTexture: GPUQueue_copyExternalImageToTexture
} = GPUQueue.prototype;

const getTexelByteSize = (format: GPUTextureFormat): number => {
  // TODO: Implement property
  switch (format) {
    case 'bgra8unorm':
      return 4;
    case 'rgba16float':
      return 8;
  }
  return 4;
};

// TODO: Implement properly
// TODO: Optimize
// TODO: Support depth
const copyTexel = (
  dst: Uint8ClampedArray,
  src: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  bytesPerRow: number,
  texelByteSize: number,
  format: GPUTextureFormat
): void => {
  switch (format) {
    case 'bgra8unorm':
      dst[y * width * texelByteSize + x * texelByteSize + 2] = src[y * bytesPerRow + x * texelByteSize + 0];
      dst[y * width * texelByteSize + x * texelByteSize + 1] = src[y * bytesPerRow + x * texelByteSize + 1];
      dst[y * width * texelByteSize + x * texelByteSize + 0] = src[y * bytesPerRow + x * texelByteSize + 2];
      dst[y * width * texelByteSize + x * texelByteSize + 3] = src[y * bytesPerRow + x * texelByteSize + 3];
      break;
    default:
      for (let i = 0; i < texelByteSize; i++) {
        dst[y * width * texelByteSize + x * texelByteSize + i] = src[y * bytesPerRow + x * texelByteSize + i];
      }
  }
};

const createReadTexturesCommand = (device: GPUDevice, textures: Set<GPUTexture>): GPUCommandBuffer => {
  const commandEncoder = GPUDevice_createCommandEncoder.call(device);

  for (const texture of textures) {
    const textureProperties = gpuTextureManager.getProperties(gpuTextureManager.getId(texture));

    let width: number;
    let height: number;
    let depthOrArrayLayers: number;
    let texelByteSize: number;
    let textureFormat: GPUTextureFormat;

    if (textureProperties.canvasContext !== undefined) {
      const { canvasContext } = textureProperties;
      // TODO: Avoid !
      ({ format: textureFormat } = gpuCanvasContextManager.getProperties(gpuCanvasContextManager.getId(canvasContext)).configuration!);
      texelByteSize = getTexelByteSize(textureFormat);
      ({ width, height } = canvasContext.canvas);
      depthOrArrayLayers = 1;
    } else {
      // descriptor is GPUTextureDescriptor or GPUExternalTextureDescriptor
      // TODO: Type check more properly
      const { descriptor: textureDescriptor } = textureProperties;
      if ('format' in textureDescriptor) {
        const descriptor = textureDescriptor as GPUTextureDescriptor;
        ({ format: textureFormat } = descriptor);
        texelByteSize = getTexelByteSize(textureFormat);
        // Why cast needed?
        ({ width, height = 1, depthOrArrayLayers = 1 } = descriptor.size as GPUExtent3DDict);
      } else {
        // TODO: Implement properly
        const descriptor = textureDescriptor as GPUExternalTextureDescriptor;
        textureFormat = 'rgba8unorm';
        const { source } = descriptor;
        // TODO: Can we rewrite the below more elegantly?
        if (source instanceof HTMLVideoElement) {
          ({ videoWidth: width, videoHeight: height } = source);
        } else {
          ({ width, height } = source);
        }
        depthOrArrayLayers = 1;
      }
    }

    // bytesPerRow must be multiply of 256
    const bytesPerRow = (width * texelByteSize + 255) & ~0xff;
    const bufferSize = bytesPerRow * height * depthOrArrayLayers;
    const copySize = { width, height, depthOrArrayLayers };

    const buffer = GPUDevice_createBuffer.call(device, {
      size: bufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    // TODO: Support stencil
    const aspect = textureFormat === 'depth24plus-stencil8' ||
                   textureFormat === 'depth32float-stencil8'
      ? 'depth-only' : 'all';

    // TODO: Use original function if copyTextureToBuffer is hooked.
    commandEncoder.copyTextureToBuffer(
      { texture, aspect },
      { buffer, bytesPerRow, rowsPerImage: height },
      copySize
    );
    GPUQueue_onSubmittedWorkDone.call(device.queue).then(() => {
      GPUBuffer_mapAsync.call(buffer, GPUMapMode.READ).then(() => {
        // TODO: Optimize if possible
        const src = new Uint8ClampedArray(GPUBuffer_getMappedRange.call(buffer));
        const dst = new ImageData(width, height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            copyTexel(dst.data, src, x, y, width, bytesPerRow,
              texelByteSize, textureFormat);
          }
        }
        GPUBuffer_destroy.call(buffer);
        gpuTextureManager.setContent(gpuTextureManager.getId(texture), dst);
      });
    });
  }
  return GPUCommandEncoder_finish.call(commandEncoder);
};

const findParentDevice = (queue: GPUQueue): GPUDevice | null => {
  // Assumes devices are not created so many.
  for (const id of gpuDeviceManager.ids()) {
    const device = gpuDeviceManager.getObject(id);
    if (device.queue === queue) {
      return device;
    }
  }
  return null;
};

function onSubmittedWorkDone(
  this: GPUQueue
): Promise<undefined> {
  const stackTrace = getStackTraceAsString(onSubmittedWorkDone);

  return callFunctionAsync<undefined>(
    this,
    GPUQueue_onSubmittedWorkDone,
    'GPUQueue.onSubmittedWorkDone',
    arguments,
    stackTrace
  );
}

function submit(
  this: GPUQueue,
  commandBuffers: GPUCommandBuffer[]
): undefined {
  const stackTrace = getStackTraceAsString(submit);

  // Find output textures
  const textures = new Set<GPUTexture>();
  for (const buffer of commandBuffers) {
    const { parentEncoder } = gpuCommandBufferManager.getProperties(gpuCommandBufferManager.getId(buffer));
    const { renderPasses } = gpuCommandEncoderManager.getProperties(gpuCommandEncoderManager.getId(parentEncoder));
    for (const pass of renderPasses) {
      const { descriptor } = gpuRenderPassEncoderManager.getProperties(gpuRenderPassEncoderManager.getId(pass));
      const { colorAttachments, depthStencilAttachment } = descriptor;
      for (const attachment of colorAttachments) {
        const { view, resolveTarget } = attachment;
        const { parentTexture } = gpuTextureViewManager.getProperties(gpuTextureViewManager.getId(view));
        if (parentTexture.sampleCount === 1) {
          textures.add(parentTexture);
        }
        if (resolveTarget !== undefined) {
          const { parentTexture } = gpuTextureViewManager.getProperties(gpuTextureViewManager.getId(resolveTarget));
          if (parentTexture.sampleCount === 1) {
            textures.add(parentTexture);
          }
        }
      }
      if (depthStencilAttachment !== undefined) {
        const { view } = depthStencilAttachment;
        const { parentTexture } = gpuTextureViewManager.getProperties(gpuTextureViewManager.getId(view));
        // depth24plus is not eligible to be copy source.
        // TODO: Support depth24plus with any workaround if possible?
        if (parentTexture.sampleCount === 1 &&
          parentTexture.format !== 'depth24plus' &&
          parentTexture.format !== 'depth24plus-stencil8') {
          textures.add(parentTexture);
        }
      }
    }
  }

  if (textures.size > 0) {
    commandBuffers = commandBuffers.slice();

    // Add a command to read output textures
    // TODO: Don't use ! because device can be already destroyed?
    commandBuffers.push(createReadTexturesCommand(findParentDevice(this)!, textures));
  }

  return callCustomFunction<undefined>(
    this,
    (): undefined => {
      return GPUQueue_submit.call(this, commandBuffers);
    },
    'GPUQueue.submit',
    arguments,
    stackTrace
  );
}

function writeBuffer(
  this: GPUQueue,
  buffer: GPUBuffer,
  bufferOffset: number,
  data: BufferSource,
  dataOffset?: number,
  size?: number
): undefined {
  const stackTrace = getStackTraceAsString(writeBuffer);

  return callFunction<undefined>(
    this,
    GPUQueue_writeBuffer,
    'GPUQueue.writeBuffer',
    arguments,
    stackTrace,
    () => {
      const isArrayBuffer = data instanceof ArrayBuffer;
      const src = isArrayBuffer ? data : data.buffer;
      const dstOffset = bufferOffset !== undefined ? bufferOffset : 0;
      // (as Float32Array) is hack because ArrayBufferView interface
      // doesn't seem to have BYTES_PER_ELEMENT
      const srcOffset = dataOffset !== undefined
        ? (isArrayBuffer ? dataOffset : dataOffset * (data as Float32Array).BYTES_PER_ELEMENT)
        : 0;
      const writeSize = size !== undefined
        ? (isArrayBuffer ? size : size * (data as Float32Array).BYTES_PER_ELEMENT)
        : data.byteLength - srcOffset;
      gpuBufferManager.updateContent(
        gpuBufferManager.getId(buffer),
        src,
        dstOffset,
        srcOffset,
        writeSize
      );
    }
  );
}

function writeTexture(
  this: GPUQueue,
  _destination: GPUImageCopyTexture,
  _data: BufferSource,
  _dataLayout: GPUImageDataLayout,
  _size: GPUExtent3D
): undefined {
  const stackTrace = getStackTraceAsString(writeTexture);

  return callFunction<undefined>(
    this,
    GPUQueue_writeTexture,
    'GPUQueue.writeTexture',
    arguments,
    stackTrace
    // TODO: gpuTextureManager.setContent()
  );
}

function copyExternalImageToTexture(
  this: GPUQueue,
  source: GPUImageCopyExternalImage,
  destination: GPUImageCopyTextureTagged,
  _copySize: GPUExtent3DStrict
): undefined {
  const stackTrace = getStackTraceAsString(copyExternalImageToTexture);

  return callFunction<undefined>(
    this,
    GPUQueue_copyExternalImageToTexture,
    'GPUQueue.copyExternalImageToTexture',
    arguments,
    stackTrace,
    () => {
      const texture = destination.texture;
      const imageData = cloneImageSourceAsImageData(source.source);
      gpuTextureManager.setContent(gpuTextureManager.getId(texture), imageData);
    }
  );
}

export class GPUQueueHook {
  static override(): void {
    GPUQueue.prototype.onSubmittedWorkDone = onSubmittedWorkDone;
    GPUQueue.prototype.submit = submit;
    GPUQueue.prototype.writeBuffer = writeBuffer;
    GPUQueue.prototype.writeTexture = writeTexture;
    GPUQueue.prototype.copyExternalImageToTexture = copyExternalImageToTexture;
  }

  static restore(): void {
    GPUQueue.prototype.onSubmittedWorkDone = GPUQueue_onSubmittedWorkDone;
    GPUQueue.prototype.submit = GPUQueue_submit;
    GPUQueue.prototype.writeBuffer = GPUQueue_writeBuffer;
    GPUQueue.prototype.writeTexture = GPUQueue_writeTexture;
    GPUQueue.prototype.copyExternalImageToTexture = GPUQueue_copyExternalImageToTexture;
  }
}
