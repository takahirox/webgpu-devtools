import { type ResourceId } from "../../common/constants";
import { type SerializedGPURenderBundleEncoder } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const renderBundleEncoders: SerializedGPURenderBundleEncoder[] = [];
const renderBundleEncoderMap: Map<ResourceId, number /*index in renderBundleEncoders*/> = new Map();

const renderBundleEncodersElement = document.getElementById('renderBundleEncoders') as HTMLLIElement;
const renderBundleEncodersTitleElement = document.getElementById('renderBundleEncodersTitle') as HTMLSpanElement;
const renderBundleEncodersSignElement = document.getElementById('renderBundleEncodersSign') as HTMLSpanElement;
const renderBundleEncodersNumElement = document.getElementById('renderBundleEncodersNum') as HTMLSpanElement;
const renderBundleEncodersListElement = document.getElementById('renderBundleEncodersList') as HTMLUListElement;

setupHidableList(renderBundleEncodersElement, renderBundleEncodersTitleElement,
                 renderBundleEncodersListElement, renderBundleEncodersSignElement);

/*
 * <hidable-list
 *   label="GPURenderBundleEncoders[${index}]"
 *   items=[
 *     <stacktrace lines=${renderBundleEncoder.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPURenderBundleEncoderElement = (renderBundleEncoder: SerializedGPURenderBundleEncoder, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in renderBundleEncoder) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(renderBundleEncoder.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = renderBundleEncoder[key as keyof SerializedGPURenderBundleEncoder];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPURenderBundleEncoders[${index}] id: ${renderBundleEncoder.id}, ${stringify(renderBundleEncoder.label)}`,
    items, `GPURenderBundleEncoder_${renderBundleEncoder.id}`);
};

export const addGPURenderBundleEncoder = (renderBundleEncoder: SerializedGPURenderBundleEncoder): void => {
  renderBundleEncoders.push(renderBundleEncoder);
  const index = renderBundleEncoders.length - 1;
  renderBundleEncoderMap.set(renderBundleEncoder.id, index);

  setResourceNumElement(renderBundleEncodersNumElement, renderBundleEncoders.length);
  renderBundleEncodersListElement.appendChild(createGPURenderBundleEncoderElement(renderBundleEncoder, index));
};

export const resetGPURenderBundleEncoders = (): void => {
  renderBundleEncoders.length = 0;
  renderBundleEncoderMap.clear();  

  setResourceNumElement(renderBundleEncodersNumElement, renderBundleEncoders.length);
  removeChildElements(renderBundleEncodersListElement);
};
