import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { serialize } from "../utils/serialize";
import {
  EncoderState,
  type ResourceId,
  stringifyEncoderState
} from "../common/constants";
import { type SerializedGPUCommandEncoder } from "../common/messages";

type GPUCommandEncoderProperties = BaseProperties & {
  descriptor?: GPUCommandEncoderDescriptor;
  renderPasses: GPURenderPassEncoder[];
  computePasses: GPUComputePassEncoder[];
  state: EncoderState;
};

// TODO: We shouldn't record the resources that can created every frame?
class GPUCommandEncoderResourceManager
  extends BaseResourceManager<GPUCommandEncoder, GPUCommandEncoderProperties> {
  add(
    obj: GPUCommandEncoder,
    stackTrace: string[],
    descriptor?: GPUCommandEncoderDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      renderPasses: [],
      computePasses: [],
      state: EncoderState.open
    });
  }

  setState(id: ResourceId, state: EncoderState): void {
    this.getProperties(id).state = state;
  }

  addRenderPass(id: ResourceId, renderPass: GPURenderPassEncoder): void {
    this.getProperties(id).renderPasses.push(renderPass);
  }

  addComputePass(id: ResourceId, computePass: GPUComputePassEncoder): void {
    this.getProperties(id).computePasses.push(computePass);
  }

  serialize(id: ResourceId): SerializedGPUCommandEncoder {
    const encoder = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: encoder.label,
      descriptor: serialize(properties.descriptor),
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      state: stringifyEncoderState(properties.state)
    };
  }
}

export const gpuCommandEncoderManager = new GPUCommandEncoderResourceManager();
