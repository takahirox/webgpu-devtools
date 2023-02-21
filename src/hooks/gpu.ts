import { callFunction, callFunctionAsync } from "./base";
import { gpuAdapterManager } from "../resource_managers/gpu_adapter";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  requestAdapter: GPU_requestAdapter,
  getPreferredCanvasFormat: GPU_getPreferredCanvasFormat
} = GPU.prototype;

function requestAdapter(
  this: GPU,
  options?: GPURequestAdapterOptions
): Promise<GPUAdapter> {
  const stackTrace = getStackTraceAsString(requestAdapter);

  return callFunctionAsync<GPUAdapter>(
    this,
    GPU_requestAdapter,
    'GPU.requestAdapter',
    arguments,
    stackTrace,
    (adapter: GPUAdapter) => {
      gpuAdapterManager.add(adapter, stackTrace, options);
    }
  );
}

function getPreferredCanvasFormat(
  this: GPU
): GPUTextureFormat {
  const stackTrace = getStackTraceAsString(getPreferredCanvasFormat);

  return callFunction<GPUTextureFormat>(
    this,
    GPU_getPreferredCanvasFormat,
    'GPU.getPreferredCanvasFormat',
    arguments,
    stackTrace
  );
}

export class GPUHook {
  static override(): void {
    GPU.prototype.requestAdapter = requestAdapter;
    GPU.prototype.getPreferredCanvasFormat = getPreferredCanvasFormat;
  }

  static restore(): void {
    GPU.prototype.requestAdapter = GPU_requestAdapter;
    GPU.prototype.getPreferredCanvasFormat = GPU_getPreferredCanvasFormat;
  }
}
