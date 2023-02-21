import { callFunction } from "./base";
import { type ResourceId } from "../common/constants";
import { gpuBindGroupLayoutManager } from "../resource_managers/gpu_bind_group_layout";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  getBindGroupLayout: GPUComputePipeline_getBindGroupLayout
} = GPUComputePipeline.prototype;

function getBindGroupLayout(
  this: GPUComputePipeline,
  index: number
): GPUBindGroupLayout {
  let id: ResourceId | null = null;

  const stackTrace = getStackTraceAsString(getBindGroupLayout);

  return callFunction<GPUBindGroupLayout>(
    this,
    GPUComputePipeline_getBindGroupLayout,
    'GPUComputePipeline.getBindGroupLayout',
    arguments,
    stackTrace,
    (layout: GPUBindGroupLayout): void => {
      id = gpuBindGroupLayoutManager.addWithPipeline(layout, stackTrace, this, index);
    },
    (e: Error): void => {
      if (id !== null) {
        gpuBindGroupLayoutManager.setErrorMessage(id, e.message);
      }
    }
  );
}

export class GPUComputePipelineHook {
  static override(): void {
    GPUComputePipeline.prototype.getBindGroupLayout = getBindGroupLayout;
  }

  static restore(): void {
    GPUComputePipeline.prototype.getBindGroupLayout = GPUComputePipeline_getBindGroupLayout;
  }
}
