import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import {
  EncoderState,
  type ResourceId,
  stringifyEncoderState
} from "../common/constants";
import { type SerializedGPUComputePassEncoder } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPUComputePassEncoderProperties = BaseProperties & {
  descriptor?: GPUComputePassDescriptor;
  parentEncoder: GPUCommandEncoder,
  state: EncoderState,
  pipeline: GPUComputePipeline | null;
};

class GPUComputePassEncoderResourceManager
  extends BaseResourceManager<GPUComputePassEncoder, GPUComputePassEncoderProperties> {
  add(
    obj: GPUComputePassEncoder,
    stackTrace: string[],
    parentEncoder: GPUCommandEncoder,
    descriptor?: GPUComputePassDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      parentEncoder,
      pipeline: null,
      state: EncoderState.open
    });
  }

  setPipeline(id: ResourceId, pipeline: GPUComputePipeline): void {
    // TODO: Record the old pipeline id?
    this.getProperties(id).pipeline = pipeline;
  }

  setState(id: ResourceId, state: EncoderState): void {
    this.getProperties(id).state = state;
  }

  serialize(id: ResourceId): SerializedGPUComputePassEncoder {
    const encoder = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: encoder.label,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      descriptor: serialize(properties.descriptor),
      parentEncoder: serialize(properties.parentEncoder),
      state: stringifyEncoderState(properties.state),
      pipeline: serialize(properties.pipeline)
    };
  }
}

export const gpuComputePassEncoderManager = new GPUComputePassEncoderResourceManager();
