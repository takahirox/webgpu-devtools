import { type ResourceId } from "../../common/constants";
import { type SerializedGPURenderBundle } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const renderBundles: SerializedGPURenderBundle[] = [];
const renderBundleMap: Map<ResourceId, number /*index in renderBundles*/> = new Map();

const renderBundlesElement = document.getElementById('renderBundles') as HTMLLIElement;
const renderBundlesTitleElement = document.getElementById('renderBundlesTitle') as HTMLSpanElement;
const renderBundlesSignElement = document.getElementById('renderBundlesSign') as HTMLSpanElement;
const renderBundlesNumElement = document.getElementById('renderBundlesNum') as HTMLSpanElement;
const renderBundlesListElement = document.getElementById('renderBundlesList') as HTMLUListElement;

setupHidableList(renderBundlesElement, renderBundlesTitleElement,
                 renderBundlesListElement, renderBundlesSignElement);

/*
 * <hidable-list
 *   label="GPURenderBundles[${index}]"
 *   items=[
 *     <stacktrace lines=${renderBundle.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPURenderBundleElement = (renderBundle: SerializedGPURenderBundle, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in renderBundle) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(renderBundle.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = renderBundle[key as keyof SerializedGPURenderBundle];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPURenderBundles[${index}] id: ${renderBundle.id}, ${stringify(renderBundle.label)}`,
    items, `GPURenderBundle_${renderBundle.id}`);
};

export const addGPURenderBundle = (renderBundle: SerializedGPURenderBundle): void => {
  renderBundles.push(renderBundle);
  const index = renderBundles.length - 1;
  renderBundleMap.set(renderBundle.id, index);

  setResourceNumElement(renderBundlesNumElement, renderBundles.length);
  renderBundlesListElement.appendChild(createGPURenderBundleElement(renderBundle, index));
};

export const resetGPURenderBundles = (): void => {
  renderBundles.length = 0;
  renderBundleMap.clear();  

  setResourceNumElement(renderBundlesNumElement, renderBundles.length);
  removeChildElements(renderBundlesListElement);
};
