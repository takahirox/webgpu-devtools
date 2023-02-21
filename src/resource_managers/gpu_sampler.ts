import { type ResourceId } from "../common/constants";
import { type SerializedGPUSampler } from "../common/messages";
import {
  type BaseProperties,
  BaseResourceManager
} from "./base";

type GPUSamplerProperties = BaseProperties & {
  descriptor?: GPUSamplerDescriptor;
};

class GPUSamplerResourceManager
  extends BaseResourceManager<GPUSampler, GPUSamplerProperties> {
  add(
    obj: GPUSampler,
    stackTrace: string[],
    descriptor?: GPUSamplerDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  serialize(id: ResourceId): SerializedGPUSampler {
    const sampler = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id: id,
      label: sampler.label,
      descriptor: properties.descriptor,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage
    };
  }
}

export const gpuSamplerManager = new GPUSamplerResourceManager();
