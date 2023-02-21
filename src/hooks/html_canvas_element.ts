import { callFunction } from "./base";
import { gpuCanvasContextManager } from "../resource_managers/gpu_canvas_context";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  getContext: HTMLCanvasElement_getContext
} = HTMLCanvasElement.prototype;

function getContext(
  this: HTMLCanvasElement,
  contextType: string
) {
  if (contextType !== 'webgpu') {
    return HTMLCanvasElement_getContext.apply(this, arguments);
  }

  const stackTrace = getStackTraceAsString(getContext);

  return callFunction<GPUCanvasContext>(
    this,
    HTMLCanvasElement_getContext,
    'HTMLCanvasElement.getContext',
    arguments,
    stackTrace,
    (context: GPUCanvasContext) => {
      gpuCanvasContextManager.add(context, stackTrace);
    }
  );
}
export class HTMLCanvasElementHook {
  static override(): void {
    HTMLCanvasElement.prototype.getContext = getContext;
  }

  static restore(): void {
    HTMLCanvasElement.prototype.getContext = HTMLCanvasElement_getContext;
  }
}

