import { callFunction } from "./base";
import { gpuRenderBundleManager } from "../resource_managers/gpu_render_bundle";
import { gpuRenderBundleEncoderManager } from "../resource_managers/gpu_render_bundle_encoder";
import { getStackTraceAsString } from "../utils/stacktrace";
import { EncoderState } from "../common/constants";

export const {
  setBindGroup: GPURenderBundleEncoder_setBindGroup,
  finish: GPURenderBundleEncoder_finish
} = GPURenderBundleEncoder.prototype;

function setBindGroup(
  this: GPURenderBundleEncoder
): undefined {
  const stackTrace = getStackTraceAsString(setBindGroup);

  // TODO: Implement properly

  return callFunction<undefined>(
    this,
    GPURenderBundleEncoder_setBindGroup,
    'GPURenderBundleEncoder.setBindGroup',
    arguments,
    stackTrace
  );
}

function finish(
  this: GPURenderBundleEncoder,
  descriptor?: GPURenderBundleDescriptor
): GPURenderBundle {
  const stackTrace = getStackTraceAsString(finish);

  // TODO: Implement properly

  return callFunction<GPURenderBundle>(
    this,
    GPURenderBundleEncoder_finish,
    'GPURenderBundleEncoder.finish',
    arguments,
    stackTrace,
    (bundle: GPURenderBundle) => {
      gpuRenderBundleManager.add(bundle, stackTrace, descriptor);
      gpuRenderBundleEncoderManager.setState(
        gpuRenderBundleEncoderManager.getId(this),
        EncoderState.ended
      );
	}
  );
}

export class GPURenderBundleEncoderHook {
  static override(): void {
    GPURenderBundleEncoder.prototype.setBindGroup = setBindGroup;
    GPURenderBundleEncoder.prototype.finish = finish;
  }

  static restore(): void {
    GPURenderBundleEncoder.prototype.setBindGroup = GPURenderBundleEncoder_setBindGroup;
    GPURenderBundleEncoder.prototype.finish = GPURenderBundleEncoder_finish;
  }
}
