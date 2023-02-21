import { type ResourceId } from "../../common/constants";
import { type SerializedGPUPipelineLayout } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const pipelineLayouts: SerializedGPUPipelineLayout[] = [];
const pipelineLayoutMap: Map<ResourceId, number /*index in pipelineLayouts*/> = new Map();

const pipelineLayoutsElement = document.getElementById('pipelineLayouts') as HTMLLIElement;
const pipelineLayoutsTitleElement = document.getElementById('pipelineLayoutsTitle') as HTMLSpanElement;
const pipelineLayoutsSignElement = document.getElementById('pipelineLayoutsSign') as HTMLSpanElement;
const pipelineLayoutsNumElement = document.getElementById('pipelineLayoutsNum') as HTMLSpanElement;
const pipelineLayoutsListElement = document.getElementById('pipelineLayoutsList') as HTMLUListElement;

setupHidableList(pipelineLayoutsElement, pipelineLayoutsTitleElement,
                 pipelineLayoutsListElement, pipelineLayoutsSignElement);

/*
 * <hidable-list
 *   label="GPUPipelineLayouts[${index}]"
 *   items=[
 *     <stacktrace lines=${pipelineLayout.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUPipelineLayoutElement = (pipelineLayout: SerializedGPUPipelineLayout, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in pipelineLayout) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(pipelineLayout.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = pipelineLayout[key as keyof SerializedGPUPipelineLayout];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUPipelineLayouts[${index}] id: ${pipelineLayout.id}, ${stringify(pipelineLayout.label)}`,
    items, `GPUPipelineLayout_${pipelineLayout.id}`);
};

export const addGPUPipelineLayout = (pipelineLayout: SerializedGPUPipelineLayout): void => {
  pipelineLayouts.push(pipelineLayout);
  const index = pipelineLayouts.length - 1;
  pipelineLayoutMap.set(pipelineLayout.id, index);

  setResourceNumElement(pipelineLayoutsNumElement, pipelineLayouts.length);
  pipelineLayoutsListElement.appendChild(createGPUPipelineLayoutElement(pipelineLayout, index));
};

export const resetGPUPipelineLayouts = (): void => {
  pipelineLayouts.length = 0;
  pipelineLayoutMap.clear();  

  setResourceNumElement(pipelineLayoutsNumElement, pipelineLayouts.length);
  removeChildElements(pipelineLayoutsListElement);
};
