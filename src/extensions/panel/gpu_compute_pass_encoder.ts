import { type ResourceId } from "../../common/constants";
import { type SerializedGPUComputePassEncoder } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const computePassEncoders: SerializedGPUComputePassEncoder[] = [];
const computePassEncoderMap: Map<ResourceId, number /*index in computePassEncoders*/> = new Map();

const computePassEncodersElement = document.getElementById('computePassEncoders') as HTMLLIElement;
const computePassEncodersTitleElement = document.getElementById('computePassEncodersTitle') as HTMLSpanElement;
const computePassEncodersSignElement = document.getElementById('computePassEncodersSign') as HTMLSpanElement;
const computePassEncodersNumElement = document.getElementById('computePassEncodersNum') as HTMLSpanElement;
const computePassEncodersListElement = document.getElementById('computePassEncodersList') as HTMLUListElement;

setupHidableList(computePassEncodersElement, computePassEncodersTitleElement,
                 computePassEncodersListElement, computePassEncodersSignElement);

/*
 * <hidable-list
 *   label="GPUComputePassEncoders[${index}]"
 *   items=[
 *     <stacktrace lines=${computePassEncoder.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUComputePassEncoderElement = (computePassEncoder: SerializedGPUComputePassEncoder, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in computePassEncoder) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(computePassEncoder.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = computePassEncoder[key as keyof SerializedGPUComputePassEncoder];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUComputePassEncoders[${index}] id: ${computePassEncoder.id}, ${stringify(computePassEncoder.label)}`,
    items, `GPUComputePassEncoder_${computePassEncoder.id}`);
};

export const addGPUComputePassEncoder = (computePassEncoder: SerializedGPUComputePassEncoder): void => {
  computePassEncoders.push(computePassEncoder);
  const index = computePassEncoders.length - 1;
  computePassEncoderMap.set(computePassEncoder.id, index);

  setResourceNumElement(computePassEncodersNumElement, computePassEncoders.length);
  computePassEncodersListElement.appendChild(createGPUComputePassEncoderElement(computePassEncoder, index));
};

export const resetGPUComputePassEncoders = (): void => {
  computePassEncoders.length = 0;
  computePassEncoderMap.clear();  

  setResourceNumElement(computePassEncodersNumElement, computePassEncoders.length);
  removeChildElements(computePassEncodersListElement);
};
