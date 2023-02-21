import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPUComputePipeline } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPUComputePipelineProperties = BaseProperties & {
  descriptor: GPUComputePipelineDescriptor;
};

class GPUComputePipelineManager
  extends BaseResourceManager<GPUComputePipeline, GPUComputePipelineProperties> {
  add(
    obj: GPUComputePipeline,
    stackTrace: string[],
    descriptor: GPUComputePipelineDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  serialize(id: ResourceId): SerializedGPUComputePipeline {
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

export const gpuComputePipelineManager = new GPUComputePipelineManager();
