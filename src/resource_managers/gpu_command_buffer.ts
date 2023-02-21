import { type ResourceId } from "../common/constants";
import {
  type BaseProperties,
  BaseResourceManager
} from "./base";

type GPUCommandBufferProperties = BaseProperties & {
  descriptor?: GPUCommandBufferDescriptor;
  parentEncoder: GPUCommandEncoder;
};

class GPUCommandBufferResourceManager
  extends BaseResourceManager<GPUCommandBuffer, GPUCommandBufferProperties> {
  add(
    obj: GPUCommandBuffer,
    stackTrace: string[],
    parentEncoder: GPUCommandEncoder,
    descriptor?: GPUCommandBufferDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      parentEncoder
    });
  }
}

export const gpuCommandBufferManager = new GPUCommandBufferResourceManager();
