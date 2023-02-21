import { type ResourceId } from "../../common/constants";
import { type SerializedGPURenderPipeline } from "../../common/messages";
import { createAnyElement } from "./any";
import { createHidableListElement, setupHidableList } from "./hidable";
import { createStackTraceElement } from "./stacktrace";
import {
  removeChildElements,
  setResourceNumElement,
  stringify
} from "./utils";

const renderPipelines: SerializedGPURenderPipeline[] = [];
const renderPipelineMap: Map<ResourceId, number /*index in renderPipelines*/> = new Map();

const renderPipelinesElement = document.getElementById('renderPipelines') as HTMLLIElement;
const renderPipelinesTitleElement = document.getElementById('renderPipelinesTitle') as HTMLSpanElement;
const renderPipelinesSignElement = document.getElementById('renderPipelinesSign') as HTMLSpanElement;
const renderPipelinesNumElement = document.getElementById('renderPipelinesNum') as HTMLSpanElement;
const renderPipelinesListElement = document.getElementById('renderPipelinesList') as HTMLUListElement;

setupHidableList(renderPipelinesElement, renderPipelinesTitleElement,
                 renderPipelinesListElement, renderPipelinesSignElement);

/*
 * <hidable-list
 *   label="GPURenderPipelines[${index}]"
 *   items=[
 *     <stacktrace lines=${renderPipeline.creationStackTrace} />,
 *     ...
 *   ]
 * />
 */
const createGPURenderPipelineElement = (renderPipeline: SerializedGPURenderPipeline, index: number): HTMLLIElement => {
  const items: HTMLLIElement[] = [];

  for (const key in renderPipeline) {
    switch (key) {
      case 'creationStackTrace':
        items.push(createStackTraceElement(renderPipeline.creationStackTrace, 'creationStackTrace:'));
        break;
      default:
        const value = renderPipeline[key as keyof SerializedGPURenderPipeline];
        items.push(createAnyElement(value, `${key}:`));
        break;
    }
  }

  return createHidableListElement(
    `GPURenderPipelines[${index}] id: ${renderPipeline.id}, ${stringify(renderPipeline.label)}`,
    items, `GPURenderPipeline_${renderPipeline.id}`);
};

export const addGPURenderPipeline = (renderPipeline: SerializedGPURenderPipeline): void => {
  renderPipelines.push(renderPipeline);
  const index = renderPipelines.length - 1;
  renderPipelineMap.set(renderPipeline.id, index);

  setResourceNumElement(renderPipelinesNumElement, renderPipelines.length);
  renderPipelinesListElement.appendChild(createGPURenderPipelineElement(renderPipeline, index));
};

export const resetGPURenderPipelines = (): void => {
  renderPipelines.length = 0;
  renderPipelineMap.clear();  

  setResourceNumElement(renderPipelinesNumElement, renderPipelines.length);
  removeChildElements(renderPipelinesListElement);
};
