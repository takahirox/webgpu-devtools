import { type ResourceId } from "../../common/constants";
import { type SerializedGPUAdapter } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const adapters: SerializedGPUAdapter[] = [];
const adapterMap: Map<ResourceId, number /*index in adapters*/> = new Map();

const adaptersElement = document.getElementById('adapters') as HTMLLIElement;
const adaptersTitleElement = document.getElementById('adaptersTitle') as HTMLSpanElement;
const adaptersSignElement = document.getElementById('adaptersSign') as HTMLSpanElement;
const adaptersNumElement = document.getElementById('adaptersNum') as HTMLSpanElement;
const adaptersListElement = document.getElementById('adaptersList') as HTMLUListElement;

setupHidableList(adaptersElement, adaptersTitleElement,
                 adaptersListElement, adaptersSignElement);

/*
 * <hidable-list
 *   label="GPUAdapters[${index}]"
 *   items=[
 *     <stacktrace lines=${adapter.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUAdapterElement = (adapter: SerializedGPUAdapter, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in adapter) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(adapter.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = adapter[key as keyof SerializedGPUAdapter];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUAdapters[${index}] id: ${adapter.id}, ${stringify(adapter.label)}`,
    items, `GPUAdapter_${adapter.id}`);
};

export const addGPUAdapter = (adapter: SerializedGPUAdapter): void => {
  adapters.push(adapter);
  const index = adapters.length - 1;
  adapterMap.set(adapter.id, index);

  setResourceNumElement(adaptersNumElement, adapters.length);
  adaptersListElement.appendChild(createGPUAdapterElement(adapter, index));
};

export const resetGPUAdapters = (): void => {
  adapters.length = 0;
  adapterMap.clear();  

  setResourceNumElement(adaptersNumElement, adapters.length);
  removeChildElements(adaptersListElement);
};
