import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPUPipelineLayout } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPUPipelineLayoutProperties = BaseProperties & {
  descriptor?: GPUPipelineLayoutDescriptor;
  pipeline?: GPURenderPipeline | GPUComputePipeline;
  index?: number;
};

class GPUPipelineLayoutManager
  extends BaseResourceManager<GPUPipelineLayout, GPUPipelineLayoutProperties> {
  add(
    obj: GPUPipelineLayout,
    stackTrace: string[],
    descriptor: GPUPipelineLayoutDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  serialize(id: ResourceId): SerializedGPUPipelineLayout {
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

export const gpuPipelineLayoutManager = new GPUPipelineLayoutManager();
