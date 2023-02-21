import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPURenderPipeline } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPURenderPipelineProperties = BaseProperties & {
  descriptor: GPURenderPipelineDescriptor;
  topology: GPUPrimitiveTopology;
};

class GPURenderPipelineResourceManager
  extends BaseResourceManager<GPURenderPipeline, GPURenderPipelineProperties> {
  add(
    obj: GPURenderPipeline,
    stackTrace: string[],
    descriptor: GPURenderPipelineDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      topology: descriptor.primitive?.topology || 'triangle-list'
    });
  }

  serialize(id: ResourceId): SerializedGPURenderPipeline {
    const layout = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: layout.label,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      descriptor: serialize(properties.descriptor),
      topology: properties.topology
    };
  }
}

export const gpuRenderPipelineManager = new GPURenderPipelineResourceManager();
