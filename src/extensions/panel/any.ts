import {
  createArrayBufferElement,
  readUrlAsArrayBuffer
} from "./arraybuffer";
import { linkToGPUObject } from "./link";
import { createShaderCodeElement } from "./shader_code";

type TypedArrayConstructor =
  Float64ArrayConstructor |
  Float32ArrayConstructor |
  Uint32ArrayConstructor |
  Int32ArrayConstructor |
  Uint16ArrayConstructor |
  Int16ArrayConstructor |
  Uint8ArrayConstructor |
  Int8ArrayConstructor;

const TypedArrays: Record<string, TypedArrayConstructor> = {
  Float64Array: Float64Array,
  Float32Array: Float32Array,
  Uint32Array: Uint32Array,
  Int32Array: Int32Array,
  Uint16Array: Uint16Array,
  Int16Array: Int16Array,
  Uint8Array: Uint8Array,
  Int8Array: Int8Array
};

/*
 * <li>
 * </li>
 */
// TODO: Avoid any
export const createAnyElement = (data: any, label: string, dataName?: string): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = `${label} `;

  if (Array.isArray(data)) {
    li.innerText += `Array[${data.length}]:`;
    const ul = document.createElement('ul');
    for (let i = 0; i < data.length; i++) {
      ul.appendChild(createAnyElement(data[i], `[${i}]:`, dataName));
    }
    li.appendChild(ul);
  } else if (typeof data === 'object' && data !== null) {
    const ul = document.createElement('ul');

    if (data.isArrayBuffer === true) {
      li.innerText += `ArrayBuffer`;
      readUrlAsArrayBuffer(data.content).then((buffer: ArrayBuffer): void => {
        ul.appendChild(createArrayBufferElement(buffer, ''));
      });
    } else if (data.isTypedArray === true) {
      li.innerText += `${data.type}`;
      readUrlAsArrayBuffer(data.content).then((buffer: ArrayBuffer): void => {
        ul.appendChild(createArrayBufferElement(buffer, '', TypedArrays[data.type]));
      });
    } else if (data.isGPUObject === true) {
      const a = document.createElement('a');
      a.href = `#${data.type}_${data.id}`;
      a.innerText = `${data.type} id: ${data.id}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        linkToGPUObject(data.type, data.id);
      });
      li.appendChild(a);
	} else {
      li.innerText += `object:`;
      for (const key in data) {
        // Special path for shader code
        if (key === 'code' && typeof data[key] === 'string') {
          ul.appendChild(createShaderCodeElement(data[key], 'code:'));
        } else {
          ul.appendChild(createAnyElement(data[key], `${key}:`, key));
        }
      }
    }

    li.appendChild(ul);
  } else if (typeof data === 'string') {
    li.innerText += `"${data}"`;
  } else {
    li.innerText += `${data}`;
  }

  return li;
};
