import { type ResourceId } from "../../common/constants";
import { type SerializedGPUSampler } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const samplers: SerializedGPUSampler[] = [];
const samplerMap: Map<ResourceId, number /*index in samplers*/> = new Map();

const samplersElement = document.getElementById('samplers') as HTMLLIElement;
const samplersTitleElement = document.getElementById('samplersTitle') as HTMLSpanElement;
const samplersSignElement = document.getElementById('samplersSign') as HTMLSpanElement;
const samplersNumElement = document.getElementById('samplersNum') as HTMLSpanElement;
const samplersListElement = document.getElementById('samplersList') as HTMLUListElement;

setupHidableList(samplersElement, samplersTitleElement,
                 samplersListElement, samplersSignElement);

/*
 * <hidable-list
 *   label="GPUSamplers[${index}]"
 *   items=[
 *     <stacktrace lines=${sampler.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUSamplerElement = (sampler: SerializedGPUSampler, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in sampler) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(sampler.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = sampler[key as keyof SerializedGPUSampler];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUSamplers[${index}] id: ${sampler.id}, ${stringify(sampler.label)}`,
    items, `GPUSampler_${sampler.id}`);
};

export const addGPUSampler = (sampler: SerializedGPUSampler): void => {
  samplers.push(sampler);
  const index = samplers.length - 1;
  samplerMap.set(sampler.id, index);

  setResourceNumElement(samplersNumElement, samplers.length);
  samplersListElement.appendChild(createGPUSamplerElement(sampler, index));
};

export const resetGPUSamplers = (): void => {
  samplers.length = 0;
  samplerMap.clear();  

  setResourceNumElement(samplersNumElement, samplers.length);
  removeChildElements(samplersListElement);
};
