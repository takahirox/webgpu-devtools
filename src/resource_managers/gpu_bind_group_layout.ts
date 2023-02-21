import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPUBindGroupLayout } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPUBindGroupLayoutProperties = BaseProperties & {
  descriptor?: GPUBindGroupLayoutDescriptor;
  pipeline?: GPURenderPipeline | GPUComputePipeline;
  index?: number;
};

class GPUBindGroupLayoutManager
  extends BaseResourceManager<GPUBindGroupLayout, GPUBindGroupLayoutProperties> {
  add(
    obj: GPUBindGroupLayout,
    stackTrace: string[],
    descriptor: GPUBindGroupLayoutDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  // TODO: Rename?
  addWithPipeline(
    obj: GPUBindGroupLayout,
    stackTrace: string[],
    pipeline: GPURenderPipeline | GPUComputePipeline,
    index: number
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      pipeline,
      index
    });
  }

  serialize(id: ResourceId): SerializedGPUBindGroupLayout {
    const layout = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: layout.label,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      descriptor: serialize(properties.descriptor),
      pipeline: serialize(properties.pipeline),
      index: properties.index
    };
  }
}

export const gpuBindGroupLayoutManager = new GPUBindGroupLayoutManager();
