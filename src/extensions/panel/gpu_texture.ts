import { type ResourceId } from "../../common/constants";
import { type SerializedTexture } from "../../common/messages";
import { createHidableListElement, setupHidableList } from "./hidable";
import { readUrlAsImage } from "./image";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const gpuTextures: SerializedTexture[] = [];
const gpuTextureMap: Map<ResourceId, number /*index in gpuTextures*/> = new Map();

const texturesElement = document.getElementById('textures') as HTMLLIElement;
const texturesTitleElement = document.getElementById('texturesTitle') as HTMLSpanElement;
const texturesSignElement = document.getElementById('texturesSign') as HTMLSpanElement;
const texturesNumElement = document.getElementById('texturesNum') as HTMLSpanElement;
const texturesListElement = document.getElementById('texturesList') as HTMLUListElement;

setupHidableList(texturesElement, texturesTitleElement,
                 texturesListElement, texturesSignElement);

const GPUTextureUsageFlagNames = [
  'COPY_SRC',
  'COPY_DST',
  'TEXTURE_BINDING',
  'STORAGE_BINDING',
  'RENDER_ATTACHMENT'
];

export const toGPUTextureUsageString = (usage: GPUTextureUsageFlags): string => {
  const flags = [];
  for (const key of GPUTextureUsageFlagNames) {
    // TODO: Avoid any
    if (usage & (GPUTextureUsage as any)[key]) {
      flags.push(key);
    }
  }
  return '(' + flags.join(' | ') + ')';
};

/*
 * <hidable-list
 *   label=${label}
 *   items=[
 *     <li>
 *       content:<br />
 *       <a href=${url} target="_blank">${img}</a>
 *     </li>,
 *     <stacktrace stacktrace=${texture.creationStackTrace} label="creationStackTrace" />,
 *     ...
 *   ]
 * />
 */
export const createTextureCommonElement = (
  texture: SerializedTexture,
  label: string,
  hideByDefault: boolean = true
): HTMLLIElement => {
  const items = [];
  for (const key in texture) {
    // TODO: Implement
    if (key === 'descriptor' || key === 'alive') {
      continue;
    }

    const value = texture[key as keyof SerializedTexture];
    const li = document.createElement('li');
    if (key === 'content') {
      li.innerText = `${key}: `;
      li.appendChild(document.createElement('br'));
      const url = texture.content as string;
      readUrlAsImage(url).then((img: HTMLImageElement): void => {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.appendChild(img);
        li.appendChild(a);
      });
    } else if (key === 'creationStackTrace' || key === 'deletionStackTrace') {
      li.appendChild(createStackTraceElement(value as string[], `${key}:`));
    } else {
      li.innerText = `${key}: ${stringify(value)}`;
      if (key === 'usage') {
        li.innerText += ' ' + toGPUTextureUsageString(value as GPUTextureUsageFlags);
      }
    }
    items.push(li);
  }

  return createHidableListElement(label, items, `GPUTexture_${texture.id}`, hideByDefault);
};

/*
 * <texture-common texutre=${texture} label=`Textures[${index}]` />
 */
const createGPUTextureElement = (texture: SerializedTexture, index: number): HTMLLIElement => {
  return createTextureCommonElement(texture, `Textures[${index}] id: ${texture.id}, ${stringify(texture.label)}`);
};

export const createGPUTextureElementById = (id: ResourceId): HTMLLIElement => {
  if (!gpuTextureMap.has(id)) {
    const li = document.createElement('li');
    li.innerText = `GPUTexture: id: ${id}`;
    return li;
  }

  const index = gpuTextureMap.get(id);
  const texture = gpuTextures[index];
  return createGPUTextureElement(texture, index)
};

export const addGPUTexture = (texture: SerializedTexture): void => {
  gpuTextures.push(texture);
  const index = gpuTextures.length - 1;
  gpuTextureMap.set(texture.id, index);

  setResourceNumElement(texturesNumElement, gpuTextures.length);
  texturesListElement.appendChild(createGPUTextureElement(texture, index));
};

export const resetGPUTextures = (): void => {
  gpuTextures.length = 0;
  gpuTextureMap.clear();  

  setResourceNumElement(texturesNumElement, gpuTextures.length);
  removeChildElements(texturesListElement);
};
