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
import { type SerializedGPURenderBundleEncoder } from "../common/messages";

type GPURenderBundleEncoderProperties = BaseProperties & {
  descriptor: GPURenderBundleEncoderDescriptor;
  state: EncoderState;
};

// TODO: We shouldn't record the resources that can created every frame?
class GPURenderBundleEncoderResourceManager
  extends BaseResourceManager<GPURenderBundleEncoder, GPURenderBundleEncoderProperties> {
  add(
    obj: GPURenderBundleEncoder,
    stackTrace: string[],
    descriptor?: GPURenderBundleEncoderDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      state: EncoderState.open
    });
  }

  setState(id: ResourceId, state: EncoderState): void {
    this.getProperties(id).state = state;
  }

  serialize(id: ResourceId): SerializedGPURenderBundleEncoder {
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

export const gpuRenderBundleEncoderManager = new GPURenderBundleEncoderResourceManager();
