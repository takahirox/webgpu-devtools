import { callFunctionAsync } from "./base";
import { gpuDeviceManager, gpuDeviceMap } from "../resource_managers/gpu_device";
import { gpuQueueManager } from "../resource_managers/gpu_queue";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  requestDevice: GPUAdapter_requestDevice,
  requestAdapterInfo: GPUAdapter_requestAdapterInfo
} = GPUAdapter.prototype;

function requestDevice(
  this: GPUAdapter,
  descriptor?: GPUDeviceDescriptor
): Promise<GPUDevice> {
  const stackTrace = getStackTraceAsString(requestDevice);

  return callFunctionAsync<GPUDevice>(
    this,
    GPUAdapter_requestDevice,
    'GPUAdapter.requestDevice',
    arguments,
    stackTrace,
    (device: GPUDevice) => {
      gpuDeviceMap.set(device, device);
      gpuDeviceManager.add(device, stackTrace, descriptor);
      gpuQueueManager.add(device.queue, stackTrace, descriptor?.defaultQueue);
    }
  );
}

function requestAdapterInfo(
  this: GPUAdapter
): Promise<GPUAdapterInfo> {
  const stackTrace = getStackTraceAsString(requestAdapterInfo);

  return callFunctionAsync<GPUAdapterInfo>(
    this,
    GPUAdapter_requestAdapterInfo,
    'GPUAdapter.requestAdapterInfo',
    arguments,
    stackTrace
  );
}

export class GPUAdapterHook {
  static override(): void {
    GPUAdapter.prototype.requestDevice = requestDevice;
    GPUAdapter.prototype.requestAdapterInfo = requestAdapterInfo;
  }

  static restore(): void {
    GPUAdapter.prototype.requestDevice = GPUAdapter_requestDevice;
    GPUAdapter.prototype.requestAdapterInfo = GPUAdapter_requestAdapterInfo;
  }
}
