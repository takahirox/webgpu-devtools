import { computeManager } from "./compute_manager";
import { drawcallManager } from "./drawcall_manager";
import { historyManager } from "./history_manager";
import { gpuManager } from "../resource_managers/gpu";
import { gpuAdapterManager } from "../resource_managers/gpu_adapter";
import { gpuBindGroupManager } from "../resource_managers/gpu_bind_group";
import { gpuBindGroupLayoutManager } from "../resource_managers/gpu_bind_group_layout";
import { gpuBufferManager } from "../resource_managers/gpu_buffer";
import { gpuCanvasContextManager } from "../resource_managers/gpu_canvas_context";
import { gpuCommandEncoderManager } from "../resource_managers/gpu_command_encoder";
import { gpuComputePassEncoderManager } from "../resource_managers/gpu_compute_pass_encoder";
import { gpuComputePipelineManager } from "../resource_managers/gpu_compute_pipeline";
import { gpuDeviceManager } from "../resource_managers/gpu_device";
import { gpuPipelineLayoutManager } from "../resource_managers/gpu_pipeline_layout";
import { gpuQueueManager } from "../resource_managers/gpu_queue";
import { gpuRenderBundleManager } from "../resource_managers/gpu_render_bundle";
import { gpuRenderBundleEncoderManager } from "../resource_managers/gpu_render_bundle_encoder";
import { gpuRenderPassEncoderManager } from "../resource_managers/gpu_render_pass_encoder";
import { gpuRenderPipelineManager } from "../resource_managers/gpu_render_pipeline";
import { gpuSamplerManager } from "../resource_managers/gpu_sampler";
import { gpuShaderModuleManager } from "../resource_managers/gpu_shader_module";
import { gpuTextureManager } from "../resource_managers/gpu_texture";
import { gpuTextureViewManager } from "../resource_managers/gpu_texture_view";
import {
  Actions,
  type SerializedTexture
} from "../common/messages";
import { dispatchCustomEvent } from "../utils/event";

class ResultReporter {
  private reportBuffers(): void {
    const ids = gpuBufferManager.ids();
    for (const id of ids) {
      const serializedBuffer = gpuBufferManager.serialize(id);
      dispatchCustomEvent(Actions.Buffer, {
        buffer: serializedBuffer
      });
    }
  }

  private reportGPUs(): void {
    for (const id of gpuManager.ids()) {
      dispatchCustomEvent(Actions.Gpu, {
        gpu: gpuManager.serialize(id)
      });
    }
  }

  private reportGPUAdapters(): void {
    for (const id of gpuAdapterManager.ids()) {
      dispatchCustomEvent(Actions.GpuAdapter, {
        adapter: gpuAdapterManager.serialize(id)
      });
    }
  }

  private reportGPUBindGroups(): void {
    for (const id of gpuBindGroupManager.ids()) {
      dispatchCustomEvent(Actions.GpuBindGroup, {
        bindGroup: gpuBindGroupManager.serialize(id)
      });
    }
  }

  private reportGPUBindGroupLayouts(): void {
    for (const id of gpuBindGroupLayoutManager.ids()) {
      dispatchCustomEvent(Actions.GpuBindGroupLayout, {
        bindGroupLayout: gpuBindGroupLayoutManager.serialize(id)
      });
    }
  }

  private reportGPUCanvasContexts(): void {
    for (const id of gpuCanvasContextManager.ids()) {
      dispatchCustomEvent(Actions.GpuCanvasContext, {
        canvasContext: gpuCanvasContextManager.serialize(id)
      });
    }
  }

  private reportGPUCommandEncoders(): void {
    for (const id of gpuCommandEncoderManager.ids()) {
      dispatchCustomEvent(Actions.GpuCommandEncoder, {
        commandEncoder: gpuCommandEncoderManager.serialize(id)
      });
    }
  }

  private reportGPUComputePassEncoders(): void {
    for (const id of gpuComputePassEncoderManager.ids()) {
      dispatchCustomEvent(Actions.GpuComputePassEncoder, {
        computePassEncoder: gpuComputePassEncoderManager.serialize(id)
      });
    }
  }

  private reportGPUComputePipelines(): void {
    for (const id of gpuComputePipelineManager.ids()) {
      dispatchCustomEvent(Actions.GpuComputePipeline, {
        computePipeline: gpuComputePipelineManager.serialize(id)
      });
    }
  }

  private reportGPUDevices(): void {
    for (const id of gpuDeviceManager.ids()) {
      dispatchCustomEvent(Actions.GpuDevice, {
        device: gpuDeviceManager.serialize(id)
      });
    }
  }

  private reportGPUPipelineLayouts(): void {
    for (const id of gpuPipelineLayoutManager.ids()) {
      dispatchCustomEvent(Actions.GpuPipelineLayout, {
        pipelineLayout: gpuPipelineLayoutManager.serialize(id)
      });
    }
  }

  private reportGPUQueues(): void {
    for (const id of gpuQueueManager.ids()) {
      dispatchCustomEvent(Actions.GpuQueue, {
        queue: gpuQueueManager.serialize(id)
      });
    }
  }

  private reportGPURenderBundles(): void {
    for (const id of gpuRenderBundleManager.ids()) {
      dispatchCustomEvent(Actions.GpuRenderBundle, {
        renderBundle: gpuRenderBundleManager.serialize(id)
      });
    }
  }

  private reportGPURenderBundleEncoders(): void {
    for (const id of gpuRenderBundleEncoderManager.ids()) {
      dispatchCustomEvent(Actions.GpuRenderBundleEncoder, {
        renderBundleEncoder: gpuRenderBundleEncoderManager.serialize(id)
      });
    }
  }

  private reportGPURenderPassEncoders(): void {
    for (const id of gpuRenderPassEncoderManager.ids()) {
      dispatchCustomEvent(Actions.GpuRenderPassEncoder, {
        renderPassEncoder: gpuRenderPassEncoderManager.serialize(id)
      });
    }
  }

  private reportGPURenderPipelines(): void {
    for (const id of gpuRenderPipelineManager.ids()) {
      dispatchCustomEvent(Actions.GpuRenderPipeline, {
        renderPipeline: gpuRenderPipelineManager.serialize(id)
      });
    }
  }

  private reportGPUSamplers(): void {
    for (const id of gpuSamplerManager.ids()) {
      dispatchCustomEvent(Actions.GpuSampler, {
        sampler: gpuSamplerManager.serialize(id)
      });
    }
  }

  private reportShaderModules(): void {
    const ids = gpuShaderModuleManager.ids();
    for (const id of ids) {
      const serializedShaderModule = gpuShaderModuleManager.serialize(id);
      dispatchCustomEvent(Actions.ShaderModule, {
        shaderModule: serializedShaderModule
      });
    }
  }

  private reportTextures(): void {
    const ids = gpuTextureManager.ids();
    for (const id of ids) {
      if (!gpuTextureManager.isFrameBuffer(id)) {
        const serializedTexture = gpuTextureManager.serialize(id);
        dispatchCustomEvent(Actions.Texture, {
          texture: serializedTexture
        });
      }
    }
  }

  private reportTextureViews(): void {
    const ids = gpuTextureViewManager.ids();
    for (const id of ids) {
      const serializedTextureView = gpuTextureViewManager.serialize(id);
      dispatchCustomEvent(Actions.TextureView, {
        textureView: serializedTextureView
      });
    }
  }

  private reportFrames(): void {
    let maxFrameNum = -1;

    // TODO: Simplify and optimize

    const framebufferMap = new Map<number, SerializedTexture>();
    for (const id of gpuTextureManager.ids()) {
      if (gpuTextureManager.isFrameBuffer(id)) {
        const serializedTexture = gpuTextureManager.serialize(id);
        const { creationFrameNum: frameNum } = serializedTexture;
        // Assuming one framebuffer per one frame
        framebufferMap.set(frameNum, serializedTexture);
        maxFrameNum = Math.max(maxFrameNum, frameNum);
      }
    }

    // TODO: Avoid any
    const drawcallMap = new Map<number, any[]>();
    for (const drawcall of drawcallManager.getHistories()) {
      const frameNum = drawcall.frameNum;
      if (!drawcallMap.has(frameNum)) {
        drawcallMap.set(frameNum, []);
      }
      drawcallMap.get(frameNum)!.push(drawcall);
      maxFrameNum = Math.max(maxFrameNum, frameNum);
    }

    // TODO: Avoid any
    const computeMap = new Map<number, any[]>();
    for (const compute of computeManager.getHistories()) {
      const frameNum = compute.frameNum;
      if (!computeMap.has(frameNum)) {
        computeMap.set(frameNum, []);
      }
      computeMap.get(frameNum)!.push(compute);
      maxFrameNum = Math.max(maxFrameNum, frameNum);
    }

    // TODO: Avoid any
    const commandMap = new Map<number, any[]>();
    for (const command of historyManager.getHistories()) {
      const frameNum = command.frameNum;
      if (!commandMap.has(frameNum)) {
        commandMap.set(frameNum, []);
      }
      commandMap.get(frameNum)!.push(command);
      maxFrameNum = Math.max(maxFrameNum, frameNum);
    }

    for (let i = 0; i <= maxFrameNum; i++) {
      dispatchCustomEvent(Actions.Frame, {
        frame: {
          frameNum: i,
          drawcalls: drawcallMap.has(i) ? drawcallMap.get(i) : [],
          computes: computeMap.has(i) ? computeMap.get(i) : [],
          commands: commandMap.has(i) ? commandMap.get(i) : [],
          framebuffer: framebufferMap.has(i) ? framebufferMap.get(i) : undefined
        }
      });
    }
  }

  report(): void {
    this.reportGPUs();
    this.reportGPUAdapters();
    this.reportGPUBindGroups();
    this.reportGPUBindGroupLayouts();
    this.reportGPUCanvasContexts();
    this.reportGPUCommandEncoders();
    this.reportGPUComputePassEncoders();
    this.reportGPUComputePipelines();
    this.reportGPUDevices();
    this.reportGPUPipelineLayouts();
    this.reportGPUQueues();
    this.reportGPURenderBundles();
    this.reportGPURenderBundleEncoders();
    this.reportGPURenderPassEncoders();
    this.reportGPURenderPipelines();
    this.reportGPUSamplers();
    this.reportBuffers();
    this.reportShaderModules();
    this.reportTextures();
    this.reportTextureViews();
    this.reportFrames();
  }
}

export const resultReporter = new ResultReporter();
