import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants";
import { type SerializedGPUDevice } from "../common/messages";
import { gpuQueueManager } from "../resource_managers/gpu_queue";

type GPUDeviceProperties = BaseProperties & {
  descriptor?: GPUDeviceDescriptor;
  features: string[];
  limits: Record<string, number>;
  queue: GPUQueue;
};

class GPUDeviceResourceManager
  extends BaseResourceManager<GPUDevice, GPUDeviceProperties> {
  add(
    obj: GPUDevice,
    stackTrace: string[],
    descriptor?: GPUDeviceDescriptor
  ): ResourceId {
    const features = [];
    for (const value of obj.features) {
      features.push(value);
    }

    const limits: Record<string, number> = {};
    for (const key in obj.limits) {
      limits[key] = obj.limits[key as keyof GPUSupportedLimits] as number;
    }

    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor,
      features,
      limits,
      queue: obj.queue
    });
  }

  serialize(id: ResourceId): SerializedGPUDevice {
    const device = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id,
      label: device.label,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      deletionFrameNum: properties.deletionFrameNum,
      deletionStackTrace: properties.deletionStackTrace,
      destroyed: properties.destroyed,
      descriptor: properties.descriptor,
      features: properties.features,
      limits: properties.limits,
      queue: gpuQueueManager.getId(properties.queue)
    };
  }
}

export const gpuDeviceManager = new GPUDeviceResourceManager();

// TODO: Avoid object
export const gpuDeviceMap = new Map<object, GPUDevice>();