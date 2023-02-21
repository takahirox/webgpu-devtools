import { callFunction } from "./base";
import { gpuCanvasContextManager } from "../resource_managers/gpu_canvas_context";
import { gpuTextureManager } from "../resource_managers/gpu_texture";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  configure: GPUCanvasContext_configure,
  unconfigure: GPUCanvasContext_unconfigure,
  getCurrentTexture: GPUCanvasContext_getCurrentTexture
} = GPUCanvasContext.prototype;

function configure(
  this: GPUCanvasContext,
  configuration: GPUCanvasConfiguration
): undefined {
  // TODO: Write comment and concern
  if (configuration.usage === undefined) {
    configuration.usage = GPUTextureUsage.RENDER_ATTACHMENT;
  }
  configuration.usage |= GPUTextureUsage.COPY_SRC;

  const stackTrace = getStackTraceAsString(configure);

  return callFunction<undefined>(
    this,
    GPUCanvasContext_configure,
    'GPUCanvasContext.configure',
    arguments,
    stackTrace,
    () => {
      gpuCanvasContextManager.setConfiguration(
        gpuCanvasContextManager.getId(this), configuration);
    }
  );
}

function unconfigure(
  this: GPUCanvasContext
): undefined {
  const stackTrace = getStackTraceAsString(unconfigure);

  return callFunction<undefined>(
    this,
    GPUCanvasContext_unconfigure,
    'GPUCanvasContext.unconfigure',
    arguments,
    stackTrace,
    () => {
      gpuCanvasContextManager.setConfiguration(
        gpuCanvasContextManager.getId(this), null);
    }
  );
};

function getCurrentTexture(
  this: GPUCanvasContext
): GPUTexture {
  const stackTrace = getStackTraceAsString(getCurrentTexture);

  return callFunction<GPUTexture>(
    this,
    GPUCanvasContext_getCurrentTexture,
    'GPUCanvasContext.getCurrentTexture',
    arguments,
    stackTrace,
    (texture: GPUTexture) => {
      gpuTextureManager.addCanvasTexture(texture, stackTrace, this);
    }
  );
};

export class GPUCanvasContextHook {
  static override(): void {
    GPUCanvasContext.prototype.configure = configure;
    GPUCanvasContext.prototype.unconfigure = unconfigure;
    GPUCanvasContext.prototype.getCurrentTexture = getCurrentTexture;
  }

  static restore(): void {
    GPUCanvasContext.prototype.configure = GPUCanvasContext_configure;
    GPUCanvasContext.prototype.unconfigure = GPUCanvasContext_unconfigure;
    GPUCanvasContext.prototype.getCurrentTexture = GPUCanvasContext_getCurrentTexture;
  }
}
