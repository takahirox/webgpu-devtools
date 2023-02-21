import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPUBindGroup } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPUBindGroupProperties = BaseProperties & {
  descriptor: GPUBindGroupDescriptor;
};

class GPUBindGroupManager
  extends BaseResourceManager<GPUBindGroup, GPUBindGroupProperties> {
  add(
    obj: GPUBindGroup,
    stackTrace: string[],
    descriptor: GPUBindGroupDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  serialize(id: ResourceId): SerializedGPUBindGroup {
    const layout = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: layout.label,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      descriptor: serialize(properties.descriptor)
    };
  }
}

export const gpuBindGroupManager = new GPUBindGroupManager();
