import { createHidableListElement } from "./hidable";
import { removeChildElements } from "./utils";

const cache = new Map<string /*url*/, Promise<ArrayBuffer>>();

export const readUrlAsArrayBuffer = (url: string): Promise<ArrayBuffer> => {
  if (cache.has(url)) {
    return cache.get(url);
  }
  const promise = new Promise((
    resolve: (buffer: ArrayBuffer) => void,
    reject: OnErrorEventHandlerNonNull
  ) => {
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(resolve)
      .catch(reject);
  });
  cache.set(url, promise);
  return promise;
};

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
  Float64: Float64Array,
  Float32: Float32Array,
  Uint32: Uint32Array,
  Int32: Int32Array,
  Uint16: Uint16Array,
  Int16: Int16Array,
  Uint8: Uint8Array,
  Int8: Int8Array
};

/*
 * <li>
 *   ${label} ArrayBuffer (${buffer.byteLength}). Read as
 *   <select onchange="readBufferContent()">
 *     <option value='Float64'>Float64</option>
 *     <option value='Float32'>Float32</option>
 *     ...
 *   </select>
 *   <ul>
 *     ...
 *   </ul>
 * </li>
 */
export const createArrayBufferElement = (
  buffer: ArrayBuffer,
  label: string,
  defaultType: TypedArrayConstructor = Float32Array
): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = `${label} ArrayBuffer (${buffer.byteLength}). Read as `;

  const select = document.createElement('select');

  for (const arrayType in TypedArrays) {
    const option = document.createElement('option');
    option.innerText = arrayType;
    option.value = arrayType;
    option.selected = TypedArrays[arrayType] === defaultType;
    select.appendChild(option);
  }

  li.appendChild(select);

  const ul = document.createElement('ul');

  const readBufferContent = () => {
    removeChildElements(ul);

    const selectedOption = select.options[select.selectedIndex];
    const TypedArray = TypedArrays[selectedOption.value as keyof typeof TypedArrays];
    const view = new TypedArray(buffer);

    const traverse = (start: number, end: number): HTMLLIElement[] => {
      const items = [];
      if (end - start > 100) {
        let unitNum = 100;
        while (end - start > unitNum * 100) {
          unitNum *= 100;
        }
        for (let i = start; i < end; i += unitNum) {
          items.push(createHidableListElement(
            `[${i}:${Math.min(i + unitNum, end) - 1}]`,
            traverse(i, Math.min(i + unitNum, end))
          ));
        }
      } else {
        for (let i = start; i < end; i++) {
          const li = document.createElement('li');
          li.innerText = `[${i}]: ${view[i]}`;
          items.push(li);
        }
      }
      return items;
    };

    for (const li of traverse(0, view.length)) {
      ul.appendChild(li);  
    }
  };

  select.addEventListener('change', () => {
    readBufferContent();
  });

  readBufferContent();

  li.appendChild(ul);
  return li;
};
