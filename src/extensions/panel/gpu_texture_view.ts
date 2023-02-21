import { type ResourceId } from "../../common/constants";
import { type SerializedTextureView } from "../../common/messages";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createLinktToGPUObjectElement } from "./link";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const gpuTextureViews: SerializedTextureView[] = [];
const gpuTextureViewMap: Map<ResourceId, number /*index in gpuTextureViews*/> = new Map();

const textureViewsElement = document.getElementById('textureViews') as HTMLLIElement;
const textureViewsTitleElement = document.getElementById('textureViewsTitle') as HTMLSpanElement;
const textureViewsSignElement = document.getElementById('textureViewsSign') as HTMLSpanElement;
const textureViewsNumElement = document.getElementById('textureViewsNum') as HTMLSpanElement;
const textureViewsListElement = document.getElementById('textureViewsList') as HTMLUListElement;

setupHidableList(textureViewsElement, textureViewsTitleElement,
                 textureViewsListElement, textureViewsSignElement);

const createGPUTextureViewDescriptorElement = (
  descriptor: GPUTextureViewDescriptor
): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = 'descriptor:';

  const ul = document.createElement('ul');

  for (const key in descriptor) {
    const li = document.createElement('li');
    const value = descriptor[key as keyof GPUTextureViewDescriptor];
    li.innerText = `${key}: ${stringify(value)}`;
    ul.appendChild(li);
  }

  li.appendChild(ul);
  return li;
};

/*
 * <hidable-list
 *   label=${label}
 *   items=[
 *     <descriptor descriptor=${textureView.descriptor} />,
 *     <stacktrace stacktrace=${textureView.creationStackTrace} label="creationStackTrace" />,
 *     ...
 *   ]
 * />
 */
const createGPUTextureViewElement = (textureView: SerializedTextureView, index: number): HTMLLIElement => {
  const items = [];

  for (const key in textureView) {
    if (key === 'descriptor') {
      items.push(createGPUTextureViewDescriptorElement(textureView.descriptor));
    } else if (key === 'parentTexture') {
      items.push(createLinktToGPUObjectElement('parentTexture:', 'GPUTexture', textureView.parentTexture));
    } else if (key === 'creationStackTrace') {
      items.push(createStackTraceElement(textureView.creationStackTrace, 'creationStackTrace:'));
    } else {
      const li = document.createElement('li');
      const value = textureView[key as keyof SerializedTextureView];
      li.innerText = `${key}: ${stringify(value)}`;
      items.push(li);
    }
  }

  return createHidableListElement(
    `TextureViews[${index}] id: ${textureView.id}, ${stringify(textureView.label)}`,
    items, `GPUTextureView_${textureView.id}`);
};

export const createGPUTextureViewElementById = (id: ResourceId): HTMLLIElement => {
  if (!gpuTextureViewMap.has(id)) {
    // TODO: What if framebuffer?
    const li = document.createElement('li');
    li.innerText = `GPUTextureView: id: ${id}`;
    return li;
  }

  const index = gpuTextureViewMap.get(id);
  const textureView = gpuTextureViews[index];
  return createGPUTextureViewElement(textureView, index)
};

export const addGPUTextureView = (textureView: SerializedTextureView): void => {
  gpuTextureViews.push(textureView);
  const index = gpuTextureViews.length - 1;
  gpuTextureViewMap.set(textureView.id, index);

  setResourceNumElement(textureViewsNumElement, gpuTextureViews.length);
  textureViewsListElement.appendChild(createGPUTextureViewElement(textureView, index));
};

export const resetGPUTextureViews = (): void => {
  gpuTextureViews.length = 0;
  gpuTextureViewMap.clear();  

  setResourceNumElement(textureViewsNumElement, gpuTextureViews.length);
  removeChildElements(textureViewsListElement);
};
