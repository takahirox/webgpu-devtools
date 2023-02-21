import { RequestAnimationFrameHook } from "./request_animation_frame";
import { HTMLCanvasElementHook } from "./html_canvas_element";
import { OffscreenCanvasHook } from "./offscreen_canvas";
import { GPUHook } from "./gpu";
import { GPUAdapterHook } from "./gpu_adapter";
import { GPUBufferHook } from "./gpu_buffer";
import { GPUCanvasContextHook } from "./gpu_canvas_context";
import { GPUCommandEncoderHook } from "./gpu_command_encoder";
import { GPUComputePassEncoderHook } from "./gpu_compute_pass_encoder";
import { GPUComputePipelineHook } from "./gpu_compute_pipeline";
import { GPUDeviceHook } from "./gpu_device";
import { GPURenderPassEncoderHook } from "./gpu_render_pass_encoder";
import { GPURenderPipelineHook } from "./gpu_render_pipeline";
import { GPUTextureHook } from "./gpu_texture";
import { GPUQueueHook } from "./gpu_queue";

// TODO: The name "Hook" might be misleading?
//       Rename to Observer, Capture, or anything else?

interface Hook {
  override(): void;
  restore(): void;
}

export class HookManager {
  // Cheap trick. *Hook classes have static override and restore methods
  // but static methods can't be defined in interface in TypeScript.
  // So casting as Hook that has non-static override and restore methods
  // here instead.
  static hooks: Hook[] = [
    RequestAnimationFrameHook,
    HTMLCanvasElementHook,
    OffscreenCanvasHook,
    GPUHook,
    GPUAdapterHook,
    GPUBufferHook,
    GPUCanvasContextHook,
    GPUCommandEncoderHook,
    GPUComputePassEncoderHook,
    GPUComputePipelineHook,
    GPUDeviceHook,
    GPURenderPassEncoderHook,
    GPURenderPipelineHook,
    GPUQueueHook,
    GPUTextureHook
  ] as Hook[];

  static override(): void {
    for (const hook of HookManager.hooks) {
      hook.override();
    }
  }

  static restore(): void {
    for (const hook of HookManager.hooks) {
      hook.restore();
    }
  }
}
