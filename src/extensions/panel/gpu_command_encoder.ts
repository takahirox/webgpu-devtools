import { type ResourceId } from "../../common/constants";
import { type SerializedGPUCommandEncoder } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const commandEncoders: SerializedGPUCommandEncoder[] = [];
const commandEncoderMap: Map<ResourceId, number /*index in commandEncoders*/> = new Map();

const commandEncodersElement = document.getElementById('commandEncoders') as HTMLLIElement;
const commandEncodersTitleElement = document.getElementById('commandEncodersTitle') as HTMLSpanElement;
const commandEncodersSignElement = document.getElementById('commandEncodersSign') as HTMLSpanElement;
const commandEncodersNumElement = document.getElementById('commandEncodersNum') as HTMLSpanElement;
const commandEncodersListElement = document.getElementById('commandEncodersList') as HTMLUListElement;

setupHidableList(commandEncodersElement, commandEncodersTitleElement,
                 commandEncodersListElement, commandEncodersSignElement);

/*
 * <hidable-list
 *   label="GPUCommandEncoders[${index}]"
 *   items=[
 *     <stacktrace lines=${commandEncoder.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPUCommandEncoderElement = (commandEncoder: SerializedGPUCommandEncoder, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in commandEncoder) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(commandEncoder.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = commandEncoder[key as keyof SerializedGPUCommandEncoder];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPUCommandEncoders[${index}] id: ${commandEncoder.id}, ${stringify(commandEncoder.label)}`,
    items, `GPUCommandEncoder_${commandEncoder.id}`);
};

export const addGPUCommandEncoder = (commandEncoder: SerializedGPUCommandEncoder): void => {
  commandEncoders.push(commandEncoder);
  const index = commandEncoders.length - 1;
  commandEncoderMap.set(commandEncoder.id, index);

  setResourceNumElement(commandEncodersNumElement, commandEncoders.length);
  commandEncodersListElement.appendChild(createGPUCommandEncoderElement(commandEncoder, index));
};

export const resetGPUCommandEncoders = (): void => {
  commandEncoders.length = 0;
  commandEncoderMap.clear();  

  setResourceNumElement(commandEncodersNumElement, commandEncoders.length);
  removeChildElements(commandEncodersListElement);
};
