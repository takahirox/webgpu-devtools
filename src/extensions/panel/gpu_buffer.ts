import { type ResourceId } from "../../common/constants";
import { type SerializedBuffer } from "../../common/messages";
import { readUrlAsArrayBuffer, createArrayBufferElement } from "./arraybuffer";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify,
  swapElement
} from "./utils";

const gpuBuffers: SerializedBuffer[] = [];
const gpuBufferMap: Map<ResourceId, number /*index in gpuBuffers*/> = new Map();

const buffersElement = document.getElementById('buffers') as HTMLLIElement;
const buffersTitleElement = document.getElementById('buffersTitle') as HTMLSpanElement;
const buffersSignElement = document.getElementById('buffersSign') as HTMLSpanElement;
const buffersNumElement = document.getElementById('buffersNum') as HTMLSpanElement;
const buffersListElement = document.getElementById('buffersList') as HTMLUListElement;

setupHidableList(buffersElement, buffersTitleElement,
                 buffersListElement, buffersSignElement);

const GPUBufferUsageFlagNames = [
  'MAP_READ',
  'MAP_WRITE',
  'COPY_SRC',
  'COPY_DST',
  'INDEX',
  'VERTEX',
  'UNIFORM',
  'STORAGE',
  'INDIRECT',
  'QUERY_RESOLVE'
];

export const toGPUBufferUsageString = (usage: GPUBufferUsageFlags): string => {
  const flags = [];
  for (const key of GPUBufferUsageFlagNames) {
    // TODO: Avoid any
    if (usage & (GPUBufferUsage as any)[key]) {
      flags.push(key);
    }
  }
  return '(' + flags.join(' | ') + ')';
};

/*
 * <li>
 *   <arraybuffer buffer=${buffer} label="content:" />
 * </li>
 */
const createGPUBufferContentElement = (buffer: SerializedBuffer): HTMLLIElement => {
  const li = document.createElement('li');

  const isIndexBuffer = (buffer.usage & GPUBufferUsage.INDEX) !== 0;

  readUrlAsArrayBuffer(buffer.content as string).then((buffer: ArrayBuffer): void => {
    const expectedType = isIndexBuffer
      // This is just a rough estimation
      ? (buffer.byteLength >= 0x10000 * 2) ? Uint32Array : Uint16Array 
      : Float32Array;
    // Ugh...
    swapElement(createArrayBufferElement(buffer, 'content:', expectedType), li);
  });

  return li;
};

/*
 * <li>
 *   descriptor:
 *   <ul>
 *     <li>size: ${descriptor.size}</li>
 *     <li>usage: ${descriptor.usage} ${toGPUBufferUsageString(descriptor.usage)}</li>
 *     <li>mappedAtCreation: ${descriptor.mappedAtCreation}</li>
 *   </ul>
 * </li>
 */
const createGPUBufferDescriptorElement = (descriptor: GPUBufferDescriptor): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = 'descriptor:';

  const ul = document.createElement('ul');

  for (const key in descriptor) {
    const value = descriptor[key as keyof GPUBufferDescriptor];
    const li = document.createElement('li');
    li.innerText = `${key}: ${stringify(value)}`;
    if (key === 'usage') {
      li.innerText += ' ' + toGPUBufferUsageString(descriptor.usage);
    }
    ul.appendChild(li);
  }

  li.appendChild(ul);
  return li;
};

/*
 * <hidable-list
 *   label="Buffers[${index}]"
 *   items=[
 *     <li>size: ${buffer.size}</li>,
 *     <li>usage: ${buffer.usage}</li>,
 *     <li>mapState: ${buffer.mapState}</li>,
 *     ...,
 *     <gpu-buffer-descriptor descriptor=${buffer.descriptor} />,
 *     <stacktrace lines=${buffer.creationStackTrace} />,
 *     <gpu-buffer-content buffer=${buffer} label="creationStackTrace:" />
 *   ]
 * />
 */
const createGPUBufferElement = (buffer: SerializedBuffer, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in buffer) {
    // TODO: Implement
    if (key === 'alive') {
      continue;
    }

    switch (key) {
      case 'content':
        items.push(createGPUBufferContentElement(buffer));
        break;
      case 'creationStackTrace':
        items.push(createStackTraceElement(buffer.creationStackTrace, 'creationStackTrace:'));
        break;
      case 'descriptor':
        items.push(createGPUBufferDescriptorElement(buffer.descriptor));
        break;
      default:
        const value = buffer[key as keyof SerializedBuffer];
        const li = document.createElement('li');
        // TODO: .replace('errorMessage', 'error'), Ugh...
        li.innerText = `${key.replace('errorMessage', 'error')}: ${stringify(value)}`;
        if (key === 'usage') {
          li.innerText += ' ' + toGPUBufferUsageString(buffer.usage);
        }
        if (key === 'errorMessage') {
          // TODO: Remove magic strings
          li.classList.add('errorLeaf');
        }
        items.push(li);
        break;
    }
  }

  return createHidableListElement(
    `Buffers[${index}] id: ${buffer.id}, ${stringify(buffer.label)}`,
    items, `GPUBuffer_${buffer.id}`);
};

export const createGPUBufferElementById = (id: ResourceId): HTMLLIElement => {
  if (!gpuBufferMap.has(id)) {
    const li = document.createElement('li');
    li.innerText = `GPUBuffer: id: ${id}`;
    return li;
  }

  const index = gpuBufferMap.get(id);
  const buffer = gpuBuffers[index];
  return createGPUBufferElement(buffer, index)
};

const highlightLikelyInvalidBuffers = (): void => {
  // TODO: Remove magic strings
  // TODO: Ugh... Rewrite more elegantly
  const elements = buffersListElement.getElementsByClassName('errorLeaf');
  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    el.classList.add('error');
    el = (el.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
    el = (el.parentElement.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
  }
  while (buffersListElement.getElementsByClassName('errorLeaf').length > 0) {
    buffersListElement.getElementsByClassName('errorLeaf')[0].classList.remove('errorLeaf');
  }
};

export const addGPUBuffer = (buffer: SerializedBuffer): void => {
  gpuBuffers.push(buffer);
  const index = gpuBuffers.length - 1;
  gpuBufferMap.set(buffer.id, index);

  setResourceNumElement(buffersNumElement, gpuBuffers.length);
  buffersListElement.appendChild(createGPUBufferElement(buffer, index));

  highlightLikelyInvalidBuffers();
};

export const resetGPUBuffers = (): void => {
  gpuBuffers.length = 0;
  gpuBufferMap.clear();  

  setResourceNumElement(buffersNumElement, gpuBuffers.length);
  removeChildElements(buffersListElement);
};
