import { type ResourceId } from "../../common/constants";
import { type SerializedGPUComputePipeline } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const computePipelines: SerializedGPUComputePipeline[] = [];
const computePipelineMap: Map<ResourceId, number /*index in computePipelines*/> = new Map();

const computePipelinesElement = document.getElementById('computePipelines') as HTMLLIElement;
const computePipelinesTitleElement = document.getElementById('computePipelinesTitle') as HTMLSpanElement;
const computePipelinesSignElement = document.getElementById('computePipelinesSign') as HTMLSpanElement;
const computePipelinesNumElement = document.getElementById('computePipelinesNum') as HTMLSpanElement;
const computePipelinesListElement = document.getElementById('computePipelinesList') as HTMLUListElement;

setupHidableList(computePipelinesElement, computePipelinesTitleElement,
                 computePipelinesListElement, computePipelinesSignElement);

/*
 * <hidable-list
 *   label="GPUComputePipelines[${index}]"
 *   items=[
 *     <stacktrace lines=${computePipeline.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUComputePipelineElement = (computePipeline: SerializedGPUComputePipeline, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in computePipeline) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(computePipeline.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = computePipeline[key as keyof SerializedGPUComputePipeline];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUComputePipelines[${index}] id: ${computePipeline.id}, ${stringify(computePipeline.label)}`,
    items, `GPUComputePipeline_${computePipeline.id}`);
};

export const addGPUComputePipeline = (computePipeline: SerializedGPUComputePipeline): void => {
  computePipelines.push(computePipeline);
  const index = computePipelines.length - 1;
  computePipelineMap.set(computePipeline.id, index);

  setResourceNumElement(computePipelinesNumElement, computePipelines.length);
  computePipelinesListElement.appendChild(createGPUComputePipelineElement(computePipeline, index));
};

export const resetGPUComputePipelines = (): void => {
  computePipelines.length = 0;
  computePipelineMap.clear();  

  setResourceNumElement(computePipelinesNumElement, computePipelines.length);
  removeChildElements(computePipelinesListElement);
};
