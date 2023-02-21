import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import {
  EncoderState,
  type ResourceId,
  stringifyEncoderState
} from "../common/constants";
import { type SerializedGPURenderPassEncoder } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPURenderPassEncoderProperties = BaseProperties & {
  descriptor: GPURenderPassDescriptor;
  parentEncoder: GPUCommandEncoder,
  state: EncoderState,
  pipeline: GPURenderPipeline | null;
  viewport: {
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number
  } | null;
};

class GPURenderPassEncoderResourceManager
  extends BaseResourceManager<GPURenderPassEncoder, GPURenderPassEncoderProperties> {
  add(
    obj: GPURenderPassEncoder,
    stackTrace: string[],
    parentEncoder: GPUCommandEncoder,
    descriptor: GPURenderPassDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      parentEncoder,
      pipeline: null,
      state: EncoderState.open,
      viewport: null
    });
  }

  setPipeline(id: ResourceId, pipeline: GPURenderPipeline): void {
    // TODO: Record the old pipeline id?
    this.getProperties(id).pipeline = pipeline;
  }

  setState(id: ResourceId, state: EncoderState): void {
    this.getProperties(id).state = state;
  }

  setViewport(
    id: ResourceId,
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number
  ): void {
    this.getProperties(id).viewport =
      { x, y, width, height, minDepth, maxDepth };
  }

  serialize(id: ResourceId): SerializedGPURenderPassEncoder {
    const encoder = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: encoder.label,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      descriptor: serialize(properties.descriptor),
      parentEncoder: serialize(properties.parentEncoder),
      state: stringifyEncoderState(properties.state),
      pipeline: serialize(properties.pipeline),
      viewport: properties.viewport
    };
  }
}

export const gpuRenderPassEncoderManager = new GPURenderPassEncoderResourceManager();
