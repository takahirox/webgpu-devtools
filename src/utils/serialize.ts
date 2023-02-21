import { gpuManager } from "../resource_managers/gpu";
import { gpuAdapterManager } from "../resource_managers/gpu_adapter";
import { gpuBindGroupManager } from "../resource_managers/gpu_bind_group";
import { gpuBindGroupLayoutManager } from "../resource_managers/gpu_bind_group_layout";
import { gpuBufferManager } from "../resource_managers/gpu_buffer";
import { gpuCanvasContextManager } from "../resource_managers/gpu_canvas_context";
import { gpuComputePassEncoderManager } from "../resource_managers/gpu_compute_pass_encoder";
import { gpuComputePipelineManager } from "../resource_managers/gpu_compute_pipeline";
import { gpuCommandBufferManager } from "../resource_managers/gpu_command_buffer";
import { gpuCommandEncoderManager } from "../resource_managers/gpu_command_encoder";
import { gpuDeviceManager } from "../resource_managers/gpu_device";
import { gpuPipelineLayoutManager } from "../resource_managers/gpu_pipeline_layout";
import { gpuQueueManager } from "../resource_managers/gpu_queue";
import { gpuRenderPassEncoderManager } from "../resource_managers/gpu_render_pass_encoder";
import { gpuRenderPipelineManager } from "../resource_managers/gpu_render_pipeline";
import { gpuSamplerManager } from "../resource_managers/gpu_sampler";
import { gpuShaderModuleManager } from "../resource_managers/gpu_shader_module";
import { gpuTextureManager } from "../resource_managers/gpu_texture";
import { gpuTextureViewManager } from "../resource_managers/gpu_texture_view";

// TODO: Consider cirtular reference to prevent infinite loop
// Ex:
//   const a = {}, b = {};
//   a.b = b, b.a = a;
// TODO: Avoid any
export const serialize = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(serialize);
  }
  if (typeof data === 'function') {
    return {
      isFunction: true,
      name: data.name
    };
  }
  if (data instanceof ArrayBuffer) {
    return {
      isArrayBuffer: true,
      content: data.slice(0)
    };
  }
  if (data instanceof Uint8Array ||
    data instanceof Int8Array ||
    data instanceof Uint16Array ||
    data instanceof Int16Array ||
    data instanceof Uint32Array ||
    data instanceof Int32Array ||
    data instanceof Float32Array ||
    data instanceof Float64Array) {
    return {
      isTypedArray: true,
      type: data.constructor.name,
      content: data.buffer.slice(0)
    };
  }
  if (data instanceof GPU) {
    return {
      isGPUObject: true,
      type: 'GPU',
      id: gpuManager.getId(data)
    };
  }
  if (data instanceof GPUAdapter) {
    return {
      isGPUObject: true,
      type: 'GPUAdapter',
      id: gpuAdapterManager.getId(data)
    };
  }
  if (data instanceof GPUBindGroup) {
    return {
      isGPUObject: true,
      type: 'GPUBindGroup',
      id: gpuBindGroupManager.getId(data)
    };
  }
  if (data instanceof GPUBindGroupLayout) {
    return {
      isGPUObject: true,
      type: 'GPUBindGroupLayout',
      id: gpuBindGroupLayoutManager.getId(data)
    };
  }
  if (data instanceof GPUBuffer) {
    return {
      isGPUObject: true,
      type: 'GPUBuffer',
      id: gpuBufferManager.getId(data)
    };
  }
  if (data instanceof GPUCanvasContext) {
    return {
      isGPUObject: true,
      type: 'GPUCanvasContext',
      id: gpuCanvasContextManager.getId(data)
    };
  }
  if (data instanceof GPUCommandBuffer) {
    return {
      isGPUObject: true,
      type: 'GPUCommandBuffer',
      id: gpuCommandBufferManager.getId(data)
    };
  }
  if (data instanceof GPUComputePassEncoder) {
    return {
      isGPUObject: true,
      type: 'GPUComputePassEncoder',
      id: gpuComputePassEncoderManager.getId(data)
    };
  }
  if (data instanceof GPUComputePipeline) {
    return {
      isGPUObject: true,
      type: 'GPUComputePieline',
      id: gpuComputePipelineManager.getId(data)
    };
  }
  if (data instanceof GPUCommandEncoder) {
    return {
      isGPUObject: true,
      type: 'GPUCommandEncoder',
      id: gpuCommandEncoderManager.getId(data)
    };
  }
  if (data instanceof GPUDevice) {
    return {
      isGPUObject: true,
      type: 'GPUDevice',
      id: gpuDeviceManager.getId(data)
    };
  }
  if (data instanceof GPUPipelineLayout) {
    return {
      isGPUObject: true,
      type: 'GPUPipelineLayout',
      id: gpuPipelineLayoutManager.getId(data)
    };
  }
  if (data instanceof GPUQueue) {
    return {
      isGPUObject: true,
      type: 'GPUQueue',
      id: gpuQueueManager.getId(data)
    };
  }
  if (data instanceof GPURenderPassEncoder) {
    return {
      isGPUObject: true,
      type: 'GPURenderPassEncoder',
      id: gpuRenderPassEncoderManager.getId(data)
    };
  }
  if (data instanceof GPURenderPipeline) {
    return {
      isGPUObject: true,
      type: 'GPURenderPipeline',
      id: gpuRenderPipelineManager.getId(data)
    };
  }
  if (data instanceof GPUSampler) {
    return {
      isGPUObject: true,
      type: 'GPUSampler',
      id: gpuSamplerManager.getId(data)
    };
  }
  if (data instanceof GPUShaderModule) {
    return {
      isGPUObject: true,
      type: 'GPUShaderModule',
      id: gpuShaderModuleManager.getId(data)
    };
  }
  if (data instanceof GPUTexture) {
    return {
      isGPUObject: true,
      type: 'GPUTexture',
      id: gpuTextureManager.getId(data)
    };
  }
  if (data instanceof GPUTextureView) {
    return {
      isGPUObject: true,
      type: 'GPUTextureView',
      id: gpuTextureViewManager.getId(data)
    };
  }
  if (data instanceof ImageBitmap ||
      data instanceof HTMLVideoElement ||
      data instanceof HTMLCanvasElement ||
      data instanceof OffscreenCanvas) {
    // TODO: Implement properly
    return {
      isMedia: true,
      type: data.constructor.name,
      width: (data as ImageBitmap).width ||
             (data as HTMLVideoElement).videoWidth,
      height: (data as ImageBitmap).height ||
              (data as HTMLVideoElement).videoHeight
    };
  }
  if (typeof data === 'object') {
    const obj: Record<string, any> = {};
    for (const key in data) {
      obj[key] = serialize(data[key]);
    }
    return obj;
  }
  return data;
};
