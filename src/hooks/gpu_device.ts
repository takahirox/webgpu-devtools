import { type ResourceId } from "../common/constants";
import { callFunction, callFunctionAsync } from "./base";
import { gpuBufferManager } from "../resource_managers/gpu_buffer";
import { gpuBindGroupManager } from "../resource_managers/gpu_bind_group";
import { gpuBindGroupLayoutManager } from "../resource_managers/gpu_bind_group_layout";
import { gpuCommandEncoderManager } from "../resource_managers/gpu_command_encoder";
import { gpuComputePipelineManager } from "../resource_managers/gpu_compute_pipeline";
import { gpuDeviceManager, gpuDeviceMap } from "../resource_managers/gpu_device";
import { gpuPipelineLayoutManager } from "../resource_managers/gpu_pipeline_layout";
import { gpuRenderPipelineManager } from "../resource_managers/gpu_render_pipeline";
import { gpuShaderModuleManager } from "../resource_managers/gpu_shader_module";
import { gpuSamplerManager } from "../resource_managers/gpu_sampler";
import { gpuTextureManager } from "../resource_managers/gpu_texture";
import { getStackTraceAsString } from "../utils/stacktrace";

// TODO: Set hooks to all the functions

export const {
  destroy: GPUDevice_destroy,
  createBuffer: GPUDevice_createBuffer,
  createTexture: GPUDevice_createTexture,
  createSampler: GPUDevice_createSampler,
  importExternalTexture: GPUDevice_importExternalTexture,
  createBindGroupLayout: GPUDevice_createBindGroupLayout,
  createPipelineLayout: GPUDevice_createPipelineLayout,
  createBindGroup: GPUDevice_createBindGroup,
  createShaderModule: GPUDevice_createShaderModule,
  createComputePipeline: GPUDevice_createComputePipeline,
  createComputePipelineAsync: GPUDevice_createComputePipelineAsync,
  createRenderPipeline: GPUDevice_createRenderPipeline,
  createRenderPipelineAsync: GPUDevice_createRenderPipelineAsync,
  createCommandEncoder: GPUDevice_createCommandEncoder
} = GPUDevice.prototype;

function destroy(
  this: GPUDevice,
): undefined {
  const stackTrace = getStackTraceAsString(destroy);

  return callFunction<undefined>(
    this,
    GPUDevice_destroy,
    'GPUDevice.destroy',
    arguments,
    stackTrace,
    () => {
      gpuDeviceManager.destroy(gpuDeviceManager.getId(this), stackTrace);
    }
  );
}

function createBuffer(
  this: GPUDevice,
  descriptor: GPUBufferDescriptor
): GPUBuffer {
  const stackTrace = getStackTraceAsString(createBuffer);

  let id: ResourceId | null = null;

  return callFunction<GPUBuffer>(
    this,
    GPUDevice_createBuffer,
    'GPUDevice.createBuffer',
    arguments,
    stackTrace,
    (buffer: GPUBuffer) => {
      gpuDeviceMap.set(buffer, this);
      id = gpuBufferManager.add(buffer, stackTrace, descriptor);
      if (descriptor.mappedAtCreation === true) {
        // Is this correct?
        gpuBufferManager.setMapMode(
          id,
          GPUMapMode.READ | GPUMapMode.WRITE,
          0,
          descriptor.size
        );
      }
    },
    (error: Error) => {
      if (id !== null) {
        gpuBufferManager.setErrorMessage(id, error.message);
      }
    }
  );
}

function createTexture(
  this: GPUDevice,
  descriptor: GPUTextureDescriptor
): GPUTexture {
  // TODO: Write comment and concern
  descriptor.usage |= GPUTextureUsage.COPY_SRC;

  const stackTrace = getStackTraceAsString(createTexture);

  let id: ResourceId | null = null;

  return callFunction<GPUTexture>(
    this,
    GPUDevice_createTexture,
    'GPUDevice.createTexture',
    arguments,
    stackTrace,
    (texture: GPUTexture) => {
      gpuDeviceMap.set(texture, this);
      id = gpuTextureManager.add(texture, stackTrace, descriptor);
    },
    (error: Error) => {
      if (id !== null) {
        gpuTextureManager.setErrorMessage(id, error.message);
      }
    }
  );
}

function createSampler(
  this: GPUDevice,
  descriptor?: GPUSamplerDescriptor
): GPUSampler {
  const stackTrace = getStackTraceAsString(createSampler);

  let id: ResourceId | null = null;

  return callFunction<GPUSampler>(
    this,
    GPUDevice_createSampler,
    'GPUDevice.createSampler',
    arguments,
    stackTrace,
    (sampler: GPUSampler) => {
      gpuDeviceMap.set(sampler, this);
      id = gpuSamplerManager.add(sampler, stackTrace, descriptor);
    },
    (error: Error) => {
      if (id !== null) {
        gpuSamplerManager.setErrorMessage(id, error.message);
      }
    }
  );
}

function importExternalTexture(
  this: GPUDevice,
  descriptor: GPUExternalTextureDescriptor
): GPUExternalTexture {
  const stackTrace = getStackTraceAsString(importExternalTexture);

  return callFunction<GPUExternalTexture>(
    this,
    GPUDevice_importExternalTexture,
    'GPUDevice.importExternalTexture',
    arguments,
    stackTrace,
    (texture: GPUExternalTexture) => {
      gpuDeviceMap.set(texture, this);
      // TODO: Implement properly. GPUTexture and GPUExternalTexture
      //       may need to be distinguished.
      gpuTextureManager.add(texture as any, stackTrace, descriptor);
    }
  );
}

function createBindGroupLayout(
  this: GPUDevice,
  descriptor: GPUBindGroupLayoutDescriptor
): GPUBindGroupLayout {
  const stackTrace = getStackTraceAsString(createBindGroupLayout);

  let id: ResourceId | null = null;

  return callFunction<GPUBindGroupLayout>(
    this,
    GPUDevice_createBindGroupLayout,
    'GPUDevice.createBindGroupLayout',
    arguments,
    stackTrace,
    (layout: GPUBindGroupLayout) => {
      gpuDeviceMap.set(layout, this);
      id = gpuBindGroupLayoutManager.add(layout, stackTrace, descriptor);
    },
    (error: Error) => {
      if (id !== null) {
        gpuBindGroupLayoutManager.setErrorMessage(id, error.message);
      }
    }
  );
}

function createPipelineLayout(
  this: GPUDevice,
  descriptor: GPUPipelineLayoutDescriptor
): GPUPipelineLayout {
  const stackTrace = getStackTraceAsString(createPipelineLayout);

  let id: ResourceId | null = null;

  return callFunction<GPUPipelineLayout>(
    this,
    GPUDevice_createPipelineLayout,
    'GPUDevice.createPipelineLayout',
    arguments,
    stackTrace,
    (layout: GPUPipelineLayout) => {
      gpuDeviceMap.set(layout, this);
      id = gpuPipelineLayoutManager.add(layout, stackTrace, descriptor);
    },
    (error: Error) => {
      if (id !== null) {
        gpuPipelineLayoutManager.setErrorMessage(id, error.message);
      }
    }
  );
}

function createBindGroup(
  this: GPUDevice,
  descriptor: GPUBindGroupDescriptor
): GPUBindGroup {
  const stackTrace = getStackTraceAsString(createBindGroup);

  let id: ResourceId | null = null;

  return callFunction<GPUBindGroup>(
    this,
    GPUDevice_createBindGroup,
    'GPUDevice.createBindGroup',
    arguments,
    stackTrace,
    (group: GPUBindGroup) => {
      gpuDeviceMap.set(group, this);
      id = gpuBindGroupManager.add(group, stackTrace, descriptor);
    },
    (error: Error) => {
      if (id !== null) {
        gpuBindGroupManager.setErrorMessage(id, error.message);
      }
    }
  );
}

function createShaderModule(
  this: GPUDevice,
  descriptor: GPUShaderModuleDescriptor
): GPUShaderModule {
  const stackTrace = getStackTraceAsString(createShaderModule);

  return callFunction<GPUShaderModule>(
    this,
    GPUDevice_createShaderModule,
    'GPUDevice.createShaderModule',
    arguments,
    stackTrace,
    (shaderModule: GPUShaderModule) => {
      gpuDeviceMap.set(shaderModule, this);
      const id = gpuShaderModuleManager.add(shaderModule, stackTrace, descriptor);
      // TODO: Use original function if GPUShaderModule hook is added
      shaderModule.getCompilationInfo().then((info: GPUCompilationInfo): void => {
        gpuShaderModuleManager.setCompilationInfo(id, info);
      });
    }
  );
}

function createComputePipeline(
  this: GPUDevice,
  descriptor: GPUComputePipelineDescriptor
): GPUComputePipeline {
  const stackTrace = getStackTraceAsString(createComputePipeline);

  return callFunction<GPUComputePipeline>(
    this,
    GPUDevice_createComputePipeline,
    'GPUDevice.createComputePipeline',
    arguments,
    stackTrace,
    (pipeline: GPUComputePipeline) => {
      gpuDeviceMap.set(pipeline, this);
      gpuComputePipelineManager.add(pipeline, stackTrace, descriptor);
    }
  );
}

function createComputePipelineAsync(
  this: GPUDevice,
  descriptor: GPUComputePipelineDescriptor
): Promise<GPUComputePipeline> {
  const stackTrace = getStackTraceAsString(createComputePipelineAsync);

  return callFunctionAsync<GPUComputePipeline>(
    this,
    GPUDevice_createComputePipelineAsync,
    'GPUDevice.createComputePipelineAsync',
    arguments,
    stackTrace,
    (pipeline: GPUComputePipeline) => {
      gpuDeviceMap.set(pipeline, this);
      gpuComputePipelineManager.add(pipeline, stackTrace, descriptor);
    }
  );
}

function createRenderPipeline(
  this: GPUDevice,
  descriptor: GPURenderPipelineDescriptor
): GPURenderPipeline {
  const stackTrace = getStackTraceAsString(createRenderPipeline);

  return callFunction<GPURenderPipeline>(
    this,
    GPUDevice_createRenderPipeline,
    'GPUDevice.createRenderPipeline',
    arguments,
    stackTrace,
    (pipeline: GPURenderPipeline) => {
      gpuDeviceMap.set(pipeline, this);
      gpuRenderPipelineManager.add(pipeline, stackTrace, descriptor);
    }
  );
}

function createRenderPipelineAsync(
  this: GPUDevice,
  descriptor: GPURenderPipelineDescriptor
): Promise<GPURenderPipeline> {
  const stackTrace = getStackTraceAsString(createRenderPipelineAsync);

  return callFunctionAsync<GPURenderPipeline>(
    this,
    GPUDevice_createRenderPipelineAsync,
    'GPUDevice.createRenderPipelineAsync',
    arguments,
    stackTrace,
    (pipeline: GPURenderPipeline) => {
      gpuDeviceMap.set(pipeline, this);
      gpuRenderPipelineManager.add(pipeline, stackTrace, descriptor);
    }
  );
}

function createCommandEncoder(
  this: GPUDevice,
  descriptor?: GPUCommandEncoderDescriptor
): GPUCommandEncoder {
  const stackTrace = getStackTraceAsString(createCommandEncoder);

  return callFunction<GPUCommandEncoder>(
    this,
    GPUDevice_createCommandEncoder,
    'GPUDevice.createCommandEncoder',
    arguments,
    stackTrace,
    (encoder: GPUCommandEncoder) => {
      gpuDeviceMap.set(encoder, this);
      gpuCommandEncoderManager.add(encoder, stackTrace, descriptor);
    }
  );
}

export class GPUDeviceHook {
  static override(): void {
    GPUDevice.prototype.destroy = destroy;
    GPUDevice.prototype.createBuffer = createBuffer;
    GPUDevice.prototype.createTexture = createTexture;
    GPUDevice.prototype.createSampler = createSampler;
    GPUDevice.prototype.importExternalTexture = importExternalTexture;
    GPUDevice.prototype.createBindGroupLayout = createBindGroupLayout;
    GPUDevice.prototype.createPipelineLayout = createPipelineLayout;
    GPUDevice.prototype.createBindGroup = createBindGroup;
    GPUDevice.prototype.createShaderModule = createShaderModule;
    GPUDevice.prototype.createComputePipeline = createComputePipeline;
    GPUDevice.prototype.createComputePipelineAsync = createComputePipelineAsync;
    GPUDevice.prototype.createRenderPipeline = createRenderPipeline;
    GPUDevice.prototype.createRenderPipelineAsync = createRenderPipelineAsync;
    GPUDevice.prototype.createCommandEncoder = createCommandEncoder;
  }

  static restore(): void {
    GPUDevice.prototype.destroy = GPUDevice_destroy;
    GPUDevice.prototype.createBuffer = GPUDevice_createBuffer;
    GPUDevice.prototype.createTexture = GPUDevice_createTexture;
    GPUDevice.prototype.createSampler = GPUDevice_createSampler;
    GPUDevice.prototype.importExternalTexture = GPUDevice_importExternalTexture;
    GPUDevice.prototype.createBindGroupLayout = GPUDevice_createBindGroupLayout;
    GPUDevice.prototype.createPipelineLayout = GPUDevice_createPipelineLayout;
    GPUDevice.prototype.createBindGroup = GPUDevice_createBindGroup;
    GPUDevice.prototype.createShaderModule = GPUDevice_createShaderModule;
    GPUDevice.prototype.createComputePipeline = GPUDevice_createComputePipeline;
    GPUDevice.prototype.createComputePipelineAsync = GPUDevice_createComputePipelineAsync;
    GPUDevice.prototype.createRenderPipeline = GPUDevice_createRenderPipeline;
    GPUDevice.prototype.createRenderPipelineAsync = GPUDevice_createRenderPipelineAsync;
    GPUDevice.prototype.createCommandEncoder = GPUDevice_createCommandEncoder;
  }
}
