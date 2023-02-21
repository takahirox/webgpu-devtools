import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPUAdapter } from "../common/messages";
import { GPUAdapter_requestAdapterInfo } from "../hooks/gpu_adapter";

type GPUAdapterProperties = BaseProperties & {
  options?: GPURequestAdapterOptions;
  features: string[];
  limits: Record<string, number>;
  isFallbackAdapter: boolean;
  info?: Record<string, string>;
};

class GPUAdapterResourceManager
  extends BaseResourceManager<GPUAdapter, GPUAdapterProperties> {
  add(
    obj: GPUAdapter,
    stackTrace: string[],
    options?: GPURequestAdapterOptions
  ): ResourceId {
    const features = [];
    for (const value of obj.features) {
      features.push(value);
    }

    const limits: Record<string, number> = {};
    for (const key in obj.limits) {
      limits[key] = obj.limits[key as keyof GPUSupportedLimits] as number;
    }

    const id = this.register(obj, {
      creationStackTrace: stackTrace,
      options,
      features,
      limits,
      isFallbackAdapter: obj.isFallbackAdapter
    });

    GPUAdapter_requestAdapterInfo.apply(obj).then((adapterInfo: GPUAdapterInfo): void => {
      const info: Record<string, string> = {};
      for (const key in adapterInfo) {
        info[key] = adapterInfo[key as keyof GPUAdapterInfo];
      }
      this.getProperties(id).info = info;
    });

    return id;
  }

  serialize(id: ResourceId): SerializedGPUAdapter {
    const properties = this.getProperties(id);
    return {
      id: id,
      label: '',
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      features: properties.features,
      limits: properties.limits,
      isFallbackAdapter: properties.isFallbackAdapter,
      info: properties.info
    };
  }
}

export const gpuAdapterManager = new GPUAdapterResourceManager();
