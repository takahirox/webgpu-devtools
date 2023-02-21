import { callFunction } from "./base";
import { gpuTextureManager } from "../resource_managers/gpu_texture";
import { gpuTextureViewManager } from "../resource_managers/gpu_texture_view";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  createView: GPUTexture_createView,
  destroy: GPUTexture_destroy
} = GPUTexture.prototype;

function createView(
  this: GPUTexture,
  descriptor?: GPUTextureViewDescriptor
): GPUTextureView {
  const stackTrace = getStackTraceAsString(createView);

  return callFunction<GPUTextureView>(
    this,
    GPUTexture_createView,
    'GPUTexture.createView',
    arguments,
    stackTrace,
    (view: GPUTextureView) => {
      gpuTextureViewManager.add(view, stackTrace, this, descriptor);
	}
  );
}

function destroy(
  this: GPUTexture
): undefined {
  const stackTrace = getStackTraceAsString(destroy);

  return callFunction<undefined>(
    this,
    GPUTexture_destroy,
    'GPUTexture.destroy',
    arguments,
    stackTrace,
    () => {
      gpuTextureManager.destroy(gpuTextureManager.getId(this), stackTrace);
	}
  );
}

export class GPUTextureHook {
  static override(): void {
    GPUTexture.prototype.createView = createView;
    GPUTexture.prototype.destroy = destroy;
  }

  static restore(): void {
    GPUTexture.prototype.createView = GPUTexture_createView;
    GPUTexture.prototype.destroy = GPUTexture_destroy;
  }
}
