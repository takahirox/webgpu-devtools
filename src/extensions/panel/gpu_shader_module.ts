import { type ResourceId } from "../../common/constants";
import { type SerializedShaderModule } from "../../common/messages";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createShaderCodeElement } from "./shader_code";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const gpuShaderModules: SerializedShaderModule[] = [];
const gpuShaderModuleMap: Map<ResourceId, SerializedShaderModule> = new Map();

const shaderModulesElement = document.getElementById('shaderModules') as HTMLLIElement;
const shaderModulesTitleElement = document.getElementById('shaderModulesTitle') as HTMLSpanElement;
const shaderModulesSignElement = document.getElementById('shaderModulesSign') as HTMLSpanElement;
const shaderModulesNumElement = document.getElementById('shaderModulesNum') as HTMLSpanElement;
const shaderModulesListElement = document.getElementById('shaderModulesList') as HTMLUListElement;

setupHidableList(shaderModulesElement, shaderModulesTitleElement,
                 shaderModulesListElement, shaderModulesSignElement);

const createCompilationMessageElement = (message: GPUCompilationMessage, label: string): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = label;

  const ul = document.createElement('ul');

  for (const key in message) {
    const li = document.createElement('li');
    li.innerText = `${key}: ${message[key as keyof GPUCompilationMessage]}`;
    ul.appendChild(li);
  }

  li.appendChild(ul);
  return li;
};

const createCompilationInfoElement = (info: GPUCompilationInfo): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = 'compilationInfo:';

  const ul = document.createElement('ul');
  for (let i = 0; i < info.messages.length; i++) {
    const li = createCompilationMessageElement(info.messages[i], `messages[${i}]:`);
    // TODO: Remove magic strings
    li.classList.add('errorLeaf');
    ul.appendChild(li);
  }
  li.appendChild(ul);

  return li;
};

/*
 * <li>
 *   descriptor:
 *   <ul>
 *     <li>
 *       code:<br>
 *       <shader-code code=${descriptor.code} />
 *     </li>
 *     ...
 *   </ul>
 * </li>
 */
// TODO: Avoid any
const createShaderModuleDescriptorElement = (
  descriptor: GPUShaderModuleDescriptor,
  info?: GPUCompilationInfo
): HTMLLIElement => {
  const li = document.createElement('li');
  li.innerText = 'descriptor:'

  const ul = document.createElement('ul');
  li.appendChild(ul);

  for (const key in descriptor) {
    switch (key) {
      case 'code':
        ul.appendChild(createShaderCodeElement(descriptor.code, 'code:', info));
        break;
      default:
        const li = document.createElement('li');
        const value = descriptor[key as keyof GPUShaderModuleDescriptor];
        li.innerText = `${key}: ${stringify(value)}`;
        ul.appendChild(li);
        break;
    }
  }

  return li;
};

/*
 * <hidable-list
 *   label="ShaderModules[${index}]"
 *   items=[
 *     <descriptor descriptor=${shaderModule.descriptor} />,
 *     <stacktrace stacktrace=${shaderModule.creationStackTrace} label="creationStackTrace" />,
 *     ...
 *   ]
 * />
 */
const createGPUShaderModuleElement = (shaderModule: SerializedShaderModule, index: number): HTMLLIElement => {
  const items = [];

  for (const key in shaderModule) {
    switch (key) {
      case 'descriptor':
        items.push(createShaderModuleDescriptorElement(shaderModule.descriptor, shaderModule.compilationInfo));
        break;
      case 'compilationInfo':
        items.push(createCompilationInfoElement(shaderModule.compilationInfo));
        break;
      case 'creationStackTrace':
        items.push(createStackTraceElement(shaderModule.creationStackTrace, 'creationStackTrace'));
        break;
      default:
        const value = shaderModule[key as keyof SerializedShaderModule];
        const li = document.createElement('li');
        li.innerText = `${key}: ${stringify(value)}`;
        items.push(li);
        break;
    }
  }

  return createHidableListElement(
    `ShaderModules[${index}] id: ${shaderModule.id}, ${stringify(shaderModule.label)}`,
    items, `GPUShaderModule_${shaderModule.id}`);
};

const highlightLikelyInvalidShaderModules = (): void => {
  // TODO: Remove magic strings
  // TODO: Ugh... Rewrite more elegantly
  const elements = shaderModulesListElement.getElementsByClassName('errorLeaf');
  for (let i = 0; i < elements.length; i++) {
    let el = elements[i];
    el.classList.add('error');
    el = (el.parentElement.parentElement as HTMLElement);
    el.classList.add('error');
    el = (el.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
    el = (el.parentElement.parentElement.parentElement.firstElementChild as HTMLElement);
    el.classList.add('error');
  }
  while (shaderModulesListElement.getElementsByClassName('errorLeaf').length > 0) {
    shaderModulesListElement.getElementsByClassName('errorLeaf')[0].classList.remove('errorLeaf');
  }
};

export const addGPUShaderModule = (shaderModule: SerializedShaderModule): void => {
  gpuShaderModules.push(shaderModule);
  gpuShaderModuleMap.set(shaderModule.id, shaderModule);

  setResourceNumElement(shaderModulesNumElement, gpuShaderModules.length);
  shaderModulesListElement.appendChild(createGPUShaderModuleElement(
    shaderModule, gpuShaderModules.length - 1));

  highlightLikelyInvalidShaderModules();
};

export const resetGPUShaderModules = (): void => {
  gpuShaderModules.length = 0;
  gpuShaderModuleMap.clear();

  setResourceNumElement(shaderModulesNumElement, gpuShaderModules.length);
  removeChildElements(shaderModulesListElement);
};
