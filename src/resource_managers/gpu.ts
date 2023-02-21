import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPU } from "../common/messages";
import { GPU_getPreferredCanvasFormat } from "../hooks/gpu";

type GPUProperties = BaseProperties & {
  preferredCanvasTextureFormat: GPUTextureFormat;
  wgslLanguageFeatures: string[];
};

class GPUResourceManager
  extends BaseResourceManager<GPU, GPUProperties> {
  add(obj: GPU): ResourceId {
    return this.register(obj, {
      creationStackTrace: [],
      preferredCanvasTextureFormat: GPU_getPreferredCanvasFormat.apply(obj),
      // TODO: Set proper wgslLanguageFeatures when browsers support them
      wgslLanguageFeatures: []
    });
  }

  serialize(id: ResourceId): SerializedGPU {
    const properties = this.getProperties(id);
    return {
      id,
      label: '',
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      preferredCanvasFormat: properties.preferredCanvasTextureFormat,
      wgslLanguageFeatures: properties.wgslLanguageFeatures
    };
  }
}

export const gpuManager = new GPUResourceManager();
