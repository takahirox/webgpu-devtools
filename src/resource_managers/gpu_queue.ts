import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPUQueue } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPUQueueProperties = BaseProperties & {
  descriptor?: GPUQueueDescriptor;
};

class GPUQueueResourceManager
  extends BaseResourceManager<GPUQueue, GPUQueueProperties> {
  add(
    obj: GPUQueue,
    stackTrace: string[],
    descriptor?: GPUQueueDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  serialize(id: ResourceId): SerializedGPUQueue {
    const queue = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id: id,
      label: queue.label,
      descriptor: serialize(properties.descriptor),
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace
    };
  }
}

export const gpuQueueManager = new GPUQueueResourceManager();
