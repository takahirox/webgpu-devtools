import { type ResourceId } from "../../common/constants";
import { type SerializedGPUDevice } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createLinktToGPUObjectElement } from "./link";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const devices: SerializedGPUDevice[] = [];
const deviceMap: Map<ResourceId, number /*index in devices*/> = new Map();

const devicesElement = document.getElementById('devices') as HTMLLIElement;
const devicesTitleElement = document.getElementById('devicesTitle') as HTMLSpanElement;
const devicesSignElement = document.getElementById('devicesSign') as HTMLSpanElement;
const devicesNumElement = document.getElementById('devicesNum') as HTMLSpanElement;
const devicesListElement = document.getElementById('devicesList') as HTMLUListElement;

setupHidableList(devicesElement, devicesTitleElement,
                 devicesListElement, devicesSignElement);

/*
 * <hidable-list
 *   label="GPUDevices[${index}]"
 *   items=[
 *     <stacktrace lines=${adapter.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUDeviceElement = (device: SerializedGPUDevice, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in device) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(device.creationStackTrace, 'creationStackTrace:'));
        break;
      case 'queue':
        items.push(createLinktToGPUObjectElement('queue:', 'GPUQueue', device.queue));
        break;
      default:
        const value = device[key as keyof SerializedGPUDevice];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUDevices[${index}] id: ${device.id}, ${stringify(device.label)}`,
    items, `GPUDevice_${device.id}`);
};

export const addGPUDevice = (device: SerializedGPUDevice): void => {
  devices.push(device);
  const index = devices.length - 1;
  deviceMap.set(device.id, index);

  setResourceNumElement(devicesNumElement, devices.length);
  devicesListElement.appendChild(createGPUDeviceElement(device, index));
};

export const resetGPUDevices = (): void => {
  devices.length = 0;
  deviceMap.clear();  

  setResourceNumElement(devicesNumElement, devices.length);
  removeChildElements(devicesListElement);
};
