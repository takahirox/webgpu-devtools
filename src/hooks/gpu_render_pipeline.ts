import { callFunction } from "./base";
import { type ResourceId } from "../common/constants";
import { gpuBindGroupLayoutManager } from "../resource_managers/gpu_bind_group_layout";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  getBindGroupLayout: GPURenderPipeline_getBindGroupLayout
} = GPURenderPipeline.prototype;

function getBindGroupLayout(
  this: GPURenderPipeline,
  index: number
): GPUBindGroupLayout {
  let id: ResourceId | null = null;

  const stackTrace = getStackTraceAsString(getBindGroupLayout);

  return callFunction<GPUBindGroupLayout>(
    this,
    GPURenderPipeline_getBindGroupLayout,
    'GPURenderPipeline.getBindGroupLayout',
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

export class GPURenderPipelineHook {
  static override(): void {
    GPURenderPipeline.prototype.getBindGroupLayout = getBindGroupLayout;
  }

  static restore(): void {
    GPURenderPipeline.prototype.getBindGroupLayout = GPURenderPipeline_getBindGroupLayout;
  }
}
