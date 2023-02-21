type Stringifiable =
  string |
  string[] |
  number |
  boolean |
  object |
  ArrayBuffer |
  ImageData |
  null |
  undefined;

export const stringify = (value: Stringifiable): string => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'boolean') {
    return `${value}`;
  }
  if (Array.isArray(value)) {
    return '[' + value.map(v => stringify(v)).join('\n') + ']';
  }
  if (typeof value === 'number') {
    return `${value}`;
  }
  if (value instanceof ArrayBuffer) {
    // Unreachable
    return 'ArrayBuffer';
  }
  if (value instanceof ImageData) {
    // Unreachable
    return 'ImageData';
  }
  if (typeof value === 'object') {
    let str = '{';
    for (const key in value) {
      str += `${key}: ${value[key as keyof typeof value]}, `;
    }
    str += '}';
    return str;
  }
  return `"${value}"`;
};

export const removeChildElements = (el: HTMLElement): void => {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }	
};

export const swapElement = (newEl: HTMLElement, oldEl: HTMLElement): void => {
  while (oldEl.firstChild) {
    newEl.appendChild(oldEl.firstChild);
  }
  if (oldEl.parentNode !== null) {
    oldEl.parentNode.insertBefore(newEl, oldEl);
    oldEl.parentNode.removeChild(oldEl);
  }
};

export const setResourceNumElement = (el: HTMLElement, count: number): void => {
  el.innerText = `${count}`;
};
