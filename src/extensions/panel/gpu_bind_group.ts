import { type ResourceId } from "../../common/constants";
import { type SerializedGPUBindGroup } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const bindGroups: SerializedGPUBindGroup[] = [];
const bindGroupMap: Map<ResourceId, number /*index in bindGroups*/> = new Map();

const bindGroupsElement = document.getElementById('bindGroups') as HTMLLIElement;
const bindGroupsTitleElement = document.getElementById('bindGroupsTitle') as HTMLSpanElement;
const bindGroupsSignElement = document.getElementById('bindGroupsSign') as HTMLSpanElement;
const bindGroupsNumElement = document.getElementById('bindGroupsNum') as HTMLSpanElement;
const bindGroupsListElement = document.getElementById('bindGroupsList') as HTMLUListElement;

setupHidableList(bindGroupsElement, bindGroupsTitleElement,
                 bindGroupsListElement, bindGroupsSignElement);

/*
 * <hidable-list
 *   label="GPUBindGroups[${index}]"
 *   items=[
 *     <stacktrace lines=${bindGroup.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUBindGroupElement = (bindGroup: SerializedGPUBindGroup, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in bindGroup) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(bindGroup.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = bindGroup[key as keyof SerializedGPUBindGroup];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUBindGroups[${index}] id: ${bindGroup.id}, ${stringify(bindGroup.label)}`,
    items, `GPUBindGroup_${bindGroup.id}`);
};

export const addGPUBindGroup = (bindGroup: SerializedGPUBindGroup): void => {
  bindGroups.push(bindGroup);
  const index = bindGroups.length - 1;
  bindGroupMap.set(bindGroup.id, index);

  setResourceNumElement(bindGroupsNumElement, bindGroups.length);
  bindGroupsListElement.appendChild(createGPUBindGroupElement(bindGroup, index));
};

export const resetGPUBindGroups = (): void => {
  bindGroups.length = 0;
  bindGroupMap.clear();  

  setResourceNumElement(bindGroupsNumElement, bindGroups.length);
  removeChildElements(bindGroupsListElement);
};
