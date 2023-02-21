import { callFunction } from "./base";
import { gpuCanvasContextManager } from "../resource_managers/gpu_canvas_context";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  getContext: OffscreenCanvas_getContext
} = OffscreenCanvas.prototype;

function getContext(
  this: OffscreenCanvas,
  contextType: string
) {
  if (contextType !== 'webgpu') {
    return OffscreenCanvas_getContext.apply(this, arguments);
  }

  const stackTrace = getStackTraceAsString(getContext);

  return callFunction<GPUCanvasContext>(
    this,
    OffscreenCanvas_getContext,
    'OffscreenCanvas.getContext',
    arguments,
    stackTrace,
    (context: GPUCanvasContext) => {
      gpuCanvasContextManager.add(context, stackTrace);
    }
  );
}

export class OffscreenCanvasHook {
  static override(): void {
    OffscreenCanvas.prototype.getContext = getContext;
  }

  static restore(): void {
    OffscreenCanvas.prototype.getContext = OffscreenCanvas_getContext;	  
  }
}
