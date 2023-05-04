import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { serialize } from "../utils/serialize";
import { type ResourceId } from "../common/constants";
import { type SerializedGPURenderBundle } from "../common/messages";

// TODO: Implement properly
type GPURenderBundleProperties = BaseProperties & {
  descriptor: GPURenderBundleDescriptor;
};

class GPURenderBundleResourceManager
  extends BaseResourceManager<GPURenderBundle, GPURenderBundleProperties> {
  add(
    obj: GPURenderBundle,
    stackTrace: string[],
    descriptor?: GPURenderBundleDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  serialize(id: ResourceId): SerializedGPURenderBundle {
    const encoder = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: encoder.label,
      descriptor: serialize(properties.descriptor),
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
    };
  }
}

export const gpuRenderBundleManager = new GPURenderBundleResourceManager();
