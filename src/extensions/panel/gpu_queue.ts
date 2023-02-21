import { type ResourceId } from "../../common/constants";
import { type SerializedGPUQueue } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const queues: SerializedGPUQueue[] = [];
const queueMap: Map<ResourceId, number /*index in queues*/> = new Map();

const queuesElement = document.getElementById('queues') as HTMLLIElement;
const queuesTitleElement = document.getElementById('queuesTitle') as HTMLSpanElement;
const queuesSignElement = document.getElementById('queuesSign') as HTMLSpanElement;
const queuesNumElement = document.getElementById('queuesNum') as HTMLSpanElement;
const queuesListElement = document.getElementById('queuesList') as HTMLUListElement;

setupHidableList(queuesElement, queuesTitleElement,
                 queuesListElement, queuesSignElement);

/*
 * <hidable-list
 *   label="GPUQueues[${index}]"
 *   items=[
 *     <stacktrace lines=${queue.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUQueueElement = (queue: SerializedGPUQueue, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in queue) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(queue.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = queue[key as keyof SerializedGPUQueue];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUQueues[${index}] id: ${queue.id}, ${stringify(queue.label)}`,
    items, `GPUQueue_${queue.id}`);
};

export const addGPUQueue = (queue: SerializedGPUQueue): void => {
  queues.push(queue);
  const index = queues.length - 1;
  queueMap.set(queue.id, index);

  setResourceNumElement(queuesNumElement, queues.length);
  queuesListElement.appendChild(createGPUQueueElement(queue, index));
};

export const resetGPUQueues = (): void => {
  queues.length = 0;
  queueMap.clear();  

  setResourceNumElement(queuesNumElement, queues.length);
  removeChildElements(queuesListElement);
};
