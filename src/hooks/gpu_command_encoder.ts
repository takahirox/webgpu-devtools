import { callFunction } from "./base";
import { gpuCommandBufferManager } from "../resource_managers/gpu_command_buffer";
import { gpuCommandEncoderManager } from "../resource_managers/gpu_command_encoder";
import { gpuComputePassEncoderManager } from "../resource_managers/gpu_compute_pass_encoder";
import { gpuRenderPassEncoderManager } from "../resource_managers/gpu_render_pass_encoder";
import { getStackTraceAsString } from "../utils/stacktrace";
import { EncoderState } from "../common/constants";

// TODO: Set hooks to all the functions

export const {
  beginRenderPass: GPUCommandEncoder_beginRenderPass,
  beginComputePass: GPUCommandEncoder_beginComputePass,
  finish: GPUCommandEncoder_finish
} = GPUCommandEncoder.prototype;

function beginRenderPass(
  this: GPUCommandEncoder,
  descriptor: GPURenderPassDescriptor
): GPURenderPassEncoder {
  const stackTrace = getStackTraceAsString(beginRenderPass);

  return callFunction<GPURenderPassEncoder>(
    this,
    GPUCommandEncoder_beginRenderPass,
    'GPUCommandEncoder.beginRenderPass',
    arguments,
    stackTrace,
    (renderPass: GPURenderPassEncoder) => {
      gpuRenderPassEncoderManager.add(renderPass, stackTrace, this, descriptor);

      const commandEncoderId = gpuCommandEncoderManager.getId(this);
      gpuCommandEncoderManager.setState(commandEncoderId, EncoderState.locked);
      gpuCommandEncoderManager.addRenderPass(commandEncoderId, renderPass);
	}
  );
}

function beginComputePass(
  this: GPUCommandEncoder,
  descriptor?: GPUComputePassDescriptor
): GPUComputePassEncoder {
  const stackTrace = getStackTraceAsString(beginComputePass);

  return callFunction<GPUComputePassEncoder>(
    this,
    GPUCommandEncoder_beginComputePass,
    'GPUCommandEncoder.beginComputePass',
    arguments,
    stackTrace,
    (computePass: GPUComputePassEncoder) => {
      gpuComputePassEncoderManager.add(computePass, stackTrace, this, descriptor);

      const commandEncoderId = gpuCommandEncoderManager.getId(this);
      gpuCommandEncoderManager.setState(commandEncoderId, EncoderState.locked);
      gpuCommandEncoderManager.addComputePass(commandEncoderId, computePass);
    }
  );
}

function finish(
  this: GPUCommandEncoder,
  descriptor?: GPUCommandEncoderDescriptor
): GPUCommandBuffer {
  const stackTrace = getStackTraceAsString(finish);

  return callFunction<GPUCommandBuffer>(
    this,
    GPUCommandEncoder_finish,
    'GPUCommandEncoder.finish',
    arguments,
    stackTrace,
    (commandBuffer: GPUCommandBuffer) => {
      gpuCommandBufferManager.add(commandBuffer, stackTrace, this, descriptor);
	}
  );
}

export class GPUCommandEncoderHook {
  static override(): void {
    GPUCommandEncoder.prototype.beginRenderPass = beginRenderPass;
    GPUCommandEncoder.prototype.beginComputePass = beginComputePass;
    GPUCommandEncoder.prototype.finish = finish;
  }

  static restore(): void {
    GPUCommandEncoder.prototype.beginRenderPass = GPUCommandEncoder_beginRenderPass;
    GPUCommandEncoder.prototype.beginComputePass = GPUCommandEncoder_beginComputePass;
    GPUCommandEncoder.prototype.finish = GPUCommandEncoder_finish;
  }
}
