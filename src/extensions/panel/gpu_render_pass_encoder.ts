import { type ResourceId } from "../../common/constants";
import { type SerializedGPURenderPassEncoder } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const renderPassEncoders: SerializedGPURenderPassEncoder[] = [];
const renderPassEncoderMap: Map<ResourceId, number /*index in renderPassEncoders*/> = new Map();

const renderPassEncodersElement = document.getElementById('renderPassEncoders') as HTMLLIElement;
const renderPassEncodersTitleElement = document.getElementById('renderPassEncodersTitle') as HTMLSpanElement;
const renderPassEncodersSignElement = document.getElementById('renderPassEncodersSign') as HTMLSpanElement;
const renderPassEncodersNumElement = document.getElementById('renderPassEncodersNum') as HTMLSpanElement;
const renderPassEncodersListElement = document.getElementById('renderPassEncodersList') as HTMLUListElement;

setupHidableList(renderPassEncodersElement, renderPassEncodersTitleElement,
                 renderPassEncodersListElement, renderPassEncodersSignElement);

/*
 * <hidable-list
 *   label="GPURenderPassEncoders[${index}]"
 *   items=[
 *     <stacktrace lines=${renderPassEncoder.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPURenderPassEncoderElement = (renderPassEncoder: SerializedGPURenderPassEncoder, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in renderPassEncoder) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(renderPassEncoder.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = renderPassEncoder[key as keyof SerializedGPURenderPassEncoder];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPURenderPassEncoders[${index}] id: ${renderPassEncoder.id}, ${stringify(renderPassEncoder.label)}`,
    items, `GPURenderPassEncoder_${renderPassEncoder.id}`);
};

export const addGPURenderPassEncoder = (renderPassEncoder: SerializedGPURenderPassEncoder): void => {
  renderPassEncoders.push(renderPassEncoder);
  const index = renderPassEncoders.length - 1;
  renderPassEncoderMap.set(renderPassEncoder.id, index);

  setResourceNumElement(renderPassEncodersNumElement, renderPassEncoders.length);
  renderPassEncodersListElement.appendChild(createGPURenderPassEncoderElement(renderPassEncoder, index));
};

export const resetGPURenderPassEncoders = (): void => {
  renderPassEncoders.length = 0;
  renderPassEncoderMap.clear();  

  setResourceNumElement(renderPassEncodersNumElement, renderPassEncoders.length);
  removeChildElements(renderPassEncodersListElement);
};
