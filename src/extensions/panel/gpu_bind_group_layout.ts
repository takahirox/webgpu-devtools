import { type ResourceId } from "../../common/constants";
import { type SerializedGPUBindGroupLayout } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const bindGroupLayouts: SerializedGPUBindGroupLayout[] = [];
const bindGroupLayoutMap: Map<ResourceId, number /*index in bindGroupLayouts*/> = new Map();

const bindGroupLayoutsElement = document.getElementById('bindGroupLayouts') as HTMLLIElement;
const bindGroupLayoutsTitleElement = document.getElementById('bindGroupLayoutsTitle') as HTMLSpanElement;
const bindGroupLayoutsSignElement = document.getElementById('bindGroupLayoutsSign') as HTMLSpanElement;
const bindGroupLayoutsNumElement = document.getElementById('bindGroupLayoutsNum') as HTMLSpanElement;
const bindGroupLayoutsListElement = document.getElementById('bindGroupLayoutsList') as HTMLUListElement;

setupHidableList(bindGroupLayoutsElement, bindGroupLayoutsTitleElement,
                 bindGroupLayoutsListElement, bindGroupLayoutsSignElement);

/*
 * <hidable-list
 *   label="GPUBindGroupLayouts[${index}]"
 *   items=[
 *     <stacktrace lines=${bindGroupLayout.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUBindGroupLayoutElement = (bindGroupLayout: SerializedGPUBindGroupLayout, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in bindGroupLayout) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(bindGroupLayout.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = bindGroupLayout[key as keyof SerializedGPUBindGroupLayout];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUBindGroupLayouts[${index}] id: ${bindGroupLayout.id}, ${stringify(bindGroupLayout.label)}`,
    items, `GPUBindGroupLayout_${bindGroupLayout.id}`);
};

export const addGPUBindGroupLayout = (bindGroupLayout: SerializedGPUBindGroupLayout): void => {
  bindGroupLayouts.push(bindGroupLayout);
  const index = bindGroupLayouts.length - 1;
  bindGroupLayoutMap.set(bindGroupLayout.id, index);

  setResourceNumElement(bindGroupLayoutsNumElement, bindGroupLayouts.length);
  bindGroupLayoutsListElement.appendChild(createGPUBindGroupLayoutElement(bindGroupLayout, index));
};

export const resetGPUBindGroupLayouts = (): void => {
  bindGroupLayouts.length = 0;
  bindGroupLayoutMap.clear();  

  setResourceNumElement(bindGroupLayoutsNumElement, bindGroupLayouts.length);
  removeChildElements(bindGroupLayoutsListElement);
};
