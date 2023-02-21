import { type ResourceId } from "../../common/constants";
import { type SerializedGPU } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const gpus: SerializedGPU[] = [];
const gpuMap: Map<ResourceId, number /*index in gpus*/> = new Map();

const gpusElement = document.getElementById('gpus') as HTMLLIElement;
const gpusTitleElement = document.getElementById('gpusTitle') as HTMLSpanElement;
const gpusSignElement = document.getElementById('gpusSign') as HTMLSpanElement;
const gpusNumElement = document.getElementById('gpusNum') as HTMLSpanElement;
const gpusListElement = document.getElementById('gpusList') as HTMLUListElement;

setupHidableList(gpusElement, gpusTitleElement,
                 gpusListElement, gpusSignElement);

/*
 * <hidable-list
 *   label="GPUs[${index}]"
 *   items=[
 *     <stacktrace lines=${gpu.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUElement = (gpu: SerializedGPU, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in gpu) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(gpu.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = gpu[key as keyof SerializedGPU];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUs[${index}] id: ${gpu.id}, ${stringify(gpu.label)}`,
    items, `GPU_${gpu.id}`);
};

export const addGPU = (gpu: SerializedGPU): void => {
  gpus.push(gpu);
  const index = gpus.length - 1;
  gpuMap.set(gpu.id, index);

  setResourceNumElement(gpusNumElement, gpus.length);
  gpusListElement.appendChild(createGPUElement(gpu, index));
};

export const resetGPUs = (): void => {
  gpus.length = 0;
  gpuMap.clear();  

  setResourceNumElement(gpusNumElement, gpus.length);
  removeChildElements(gpusListElement);
};
