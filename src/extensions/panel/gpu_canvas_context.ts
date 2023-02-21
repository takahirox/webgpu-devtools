import { type ResourceId } from "../../common/constants";
import { type SerializedGPUCanvasContext } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const canvasContexts: SerializedGPUCanvasContext[] = [];
const canvasContextMap: Map<ResourceId, number /*index in canvasContexts*/> = new Map();

const canvasContextsElement = document.getElementById('canvasContexts') as HTMLLIElement;
const canvasContextsTitleElement = document.getElementById('canvasContextsTitle') as HTMLSpanElement;
const canvasContextsSignElement = document.getElementById('canvasContextsSign') as HTMLSpanElement;
const canvasContextsNumElement = document.getElementById('canvasContextsNum') as HTMLSpanElement;
const canvasContextsListElement = document.getElementById('canvasContextsList') as HTMLUListElement;

setupHidableList(canvasContextsElement, canvasContextsTitleElement,
                 canvasContextsListElement, canvasContextsSignElement);

/*
 * <hidable-list
 *   label="GPUCanvasContexts[${index}]"
 *   items=[
 *     <stacktrace lines=${canvasContext.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUCanvasContextElement = (canvasContext: SerializedGPUCanvasContext, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in canvasContext) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(canvasContext.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = canvasContext[key as keyof SerializedGPUCanvasContext];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUCanvasContexts[${index}] id: ${canvasContext.id}, ${stringify(canvasContext.label)}`,
    items, `GPUCanvasContext_${canvasContext.id}`);
};

export const addGPUCanvasContext = (canvasContext: SerializedGPUCanvasContext): void => {
  canvasContexts.push(canvasContext);
  const index = canvasContexts.length - 1;
  canvasContextMap.set(canvasContext.id, index);

  setResourceNumElement(canvasContextsNumElement, canvasContexts.length);
  canvasContextsListElement.appendChild(createGPUCanvasContextElement(canvasContext, index));
};

export const resetGPUCanvasContexts = (): void => {
  canvasContexts.length = 0;
  canvasContextMap.clear();  

  setResourceNumElement(canvasContextsNumElement, canvasContexts.length);
  removeChildElements(canvasContextsListElement);
};
