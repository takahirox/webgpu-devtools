import { createCommandsElement } from "./command";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createTextureCommonElement } from "./gpu_texture";
import {
  removeChildElements,
  setResourceNumElement
} from "./utils";

// TODO: Avoid any
const frames: any[] = [];
const frameMap: Map<number /*frameNum*/, any> = new Map();

const framesElement = document.getElementById('frames') as HTMLLIElement;
const framesTitleElement = document.getElementById('framesTitle') as HTMLSpanElement;
const framesSignElement = document.getElementById('framesSign') as HTMLSpanElement;
const framesNumElement = document.getElementById('framesNum') as HTMLSpanElement;
const framesListElement = document.getElementById('framesList') as HTMLUListElement;

setupHidableList(framesElement, framesTitleElement,
                 framesListElement, framesSignElement);

/*
 * <hidable-list
 *   label=`Drawcalls: [${drawcalls.length}]`
 *   items=${drawcalls.map(drawcall => {
 *     <li>[${i}]: ${drawcall.count} (${drawcall.evaluatedCount})), ${drawcall.instanceCount} instance(s), "${drawcall.topology}"</li>
 *   })}
 * </li>
 */
// TODO: Avoid any
const createDrawcallsElement = (drawcalls: any[]): HTMLLIElement => {
  const items = [];

  for (let i = 0; i < drawcalls.length; i++) {
    const drawcall = drawcalls[i];
    const li = document.createElement('li');
    li.innerText = `[${i}]: ${drawcall.count} (${drawcall.evaluatedCount}), ${drawcall.instanceCount} instance(s), "${drawcall.topology}"`;
    items.push(li);
  }

  return createHidableListElement(`Drawcalls: [${drawcalls.length}]`, items);
};

/*
 * <hidable-list
 *   label=`Computes: [${computes.length}]`
 *   items=${computes.map(compute => {
 *     <li>`[${i}]: countX:${compute.workgroupCountX}, countY:${compute.workgroupCountY}, countZ:${compute.workgroupCountZ}`</li>
 *   })}
 * </li>
 */
// TODO: Avoid any
const createComputesElement = (computes: any[]): HTMLLIElement => {
  const items = [];

  for (let i = 0; i < computes.length; i++) {
    const compute = computes[i];
    const li = document.createElement('li');
    li.innerText = `[${i}]: countX:${compute.workgroupCountX}, countY:${compute.workgroupCountY}, countZ:${compute.workgroupCountZ}`;
    items.push(li);
  }

  return createHidableListElement(`Computes: [${computes.length}]`, items);
};

/*
 * <hidable-list
 *   label=`Frames[${index}]`
 *   item=[
 *     <li>${frame.frameNum}</li>,
 *     <drawcalls drawcalls=${frame.drawcalls} />,
 *     <commands commands=${frame.commands} />,
 *     <framebuffer framebuffer=${frame.framebuffer} />
 *   ]
 * />
 */
// TODO: Avoid any
const createFrameElement = (frame: any, index: number): HTMLLIElement => {
  const items = [];

  const li = document.createElement('li');
  li.innerText = `frame# ${frame.frameNum}`;
  items.push(li);

  if (frame.drawcalls !== undefined) {
    items.push(createDrawcallsElement(frame.drawcalls));
  }
  if (frame.computes !== undefined) {
    items.push(createComputesElement(frame.computes));
  }
  if (frame.commands !== undefined) {
    items.push(createCommandsElement(frame.commands));
  }
  if (frame.framebuffer !== undefined) {
    items.push(createTextureCommonElement(frame.framebuffer, `Framebuffer: id ${frame.framebuffer.id}`, false));
  }

  return createHidableListElement(
    `Frames[${index}] frame# ${frame.frameNum}`,
    items, `Frame_${frame.frameNum}`, false);
};

const highlightErrorCommands = (): void => {
  // TODO: Remove magic strings
  // TODO: Ugh... Rewrite more elegantly
  const elements = framesListElement.getElementsByClassName('errorLeaf');
  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    el.classList.add('error');
    el = (el.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
    el = (el.parentElement.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
    el = (el.parentElement.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
    el = (el.parentElement.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
  }
  while (framesListElement.getElementsByClassName('errorLeaf').length > 0) {
    framesListElement.getElementsByClassName('errorLeaf')[0].classList.remove('errorLeaf');
  }
};

export const addFrame = (frame: any): void => {
  frames.push(frame);
  frameMap.set(frame.frameNum, frame);

  setResourceNumElement(framesNumElement, frames.length);
  framesListElement.appendChild(createFrameElement(frame, frames.length - 1));

  highlightErrorCommands();
};

export const resetFrames = (): void => {
  frames.length = 0;
  frameMap.clear();  

  setResourceNumElement(framesNumElement, frames.length);
  removeChildElements(framesListElement);
};
