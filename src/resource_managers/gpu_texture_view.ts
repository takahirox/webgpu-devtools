import { type ResourceId } from "../common/constants";
import { type SerializedTextureView } from "../common/messages";
import { gpuTextureManager } from "./gpu_texture";
import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { deepCopy } from "../utils/copy";

type GPUTextureViewProperties = BaseProperties & {
  descriptor?: GPUTextureViewDescriptor;
  parentTexture: GPUTexture;
};

class GPUTextureViewResourceManager
  extends BaseResourceManager<GPUTextureView, GPUTextureViewProperties> {
  add(
    obj: GPUTextureView,
    stackTrace: string[],
    parentTexture: GPUTexture,
    descriptor?: GPUTextureViewDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      parentTexture
    });
  }

  serialize(id: ResourceId): SerializedTextureView {
    const textureView = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id: id,
      label: textureView.label,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      descriptor: deepCopy(properties.descriptor) as GPUTextureViewDescriptor,
      parentTexture: gpuTextureManager.getId(properties.parentTexture)
    };
  }
}

export const gpuTextureViewManager = new GPUTextureViewResourceManager();
