import { callFunction } from "./base";
import { gpuCommandEncoderManager } from "../resource_managers/gpu_command_encoder";
import { gpuComputePassEncoderManager } from "../resource_managers/gpu_compute_pass_encoder";
import { computeManager } from "../analyzers/compute_manager";
import { getStackTraceAsString } from "../utils/stacktrace";
import { EncoderState } from "../common/constants";

// TODO: Set hooks to all the functions

export const {
  setPipeline: GPUComputePassEncoder_setPipeline,
  dispatchWorkgroups: GPUComputePassEncoder_dispatchWorkgroups,
  end: GPUComputePassEncoder_end
} = GPUComputePassEncoder.prototype;

function setPipeline(
  this: GPUComputePassEncoder,
  pipeline: GPUComputePipeline
): undefined {
  const stackTrace = getStackTraceAsString(setPipeline);

  return callFunction<undefined>(
    this,
    GPUComputePassEncoder_setPipeline,
    'GPUComputePassEncoder.setPipeline',
    arguments,
    stackTrace,
    () => {
      gpuComputePassEncoderManager.setPipeline(
        gpuComputePassEncoderManager.getId(this),
        pipeline
      );
	}
  );
}

function dispatchWorkgroups(
  this: GPUComputePassEncoder,
  workgroupCountX: number,
  workgroupCountY: number = 1,
  workgroupCountZ: number = 1
): undefined {
  const stackTrace = getStackTraceAsString(dispatchWorkgroups);

  return callFunction<undefined>(
    this,
    GPUComputePassEncoder_dispatchWorkgroups,
    'GPUComputePassEncoder.dispatchWorkgroups',
    arguments,
    stackTrace,
    () => {
      computeManager.dispatchWorkgroups(
        workgroupCountX, workgroupCountY, workgroupCountZ);
    }
  );
};

function end(
  this: GPUComputePassEncoder
): undefined {
  const stackTrace = getStackTraceAsString(end);

  return callFunction<undefined>(
    this,
    GPUComputePassEncoder_end,
    'GPUComputePassEncoder.end',
    arguments,
    stackTrace,
    () => {
      gpuComputePassEncoderManager.setState(
        gpuComputePassEncoderManager.getId(this),
        EncoderState.ended
      );
      const { parentEncoder } = gpuComputePassEncoderManager.getProperties(
        gpuComputePassEncoderManager.getId(this)
      );
      gpuCommandEncoderManager.setState(
        gpuCommandEncoderManager.getId(parentEncoder),
        EncoderState.open
      );
    }
  );
};

export class GPUComputePassEncoderHook {
  static override(): void {
    GPUComputePassEncoder.prototype.setPipeline = setPipeline;
    GPUComputePassEncoder.prototype.dispatchWorkgroups = dispatchWorkgroups;
    GPUComputePassEncoder.prototype.end = end;
  }

  static restore(): void {
    GPUComputePassEncoder.prototype.setPipeline = GPUComputePassEncoder_setPipeline;
    GPUComputePassEncoder.prototype.dispatchWorkgroups = GPUComputePassEncoder_dispatchWorkgroups;
    GPUComputePassEncoder.prototype.end = GPUComputePassEncoder_end;
  }
}
