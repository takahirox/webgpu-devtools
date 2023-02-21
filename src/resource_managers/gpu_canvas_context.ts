import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { type ResourceId } from "../common/constants"
import { type SerializedGPUCanvasContext } from "../common/messages";
import { serialize } from "../utils/serialize";

type GPUCanvasContextProperties = BaseProperties & {
  configuration: GPUCanvasConfiguration | null;
};

class GPUCanvasContextResourceManager
  extends BaseResourceManager<GPUCanvasContext, GPUCanvasContextProperties> {
  add(
    obj: GPUCanvasContext,
    stackTrace: string[]
  ): ResourceId {
    return this.register(obj, {
      configuration: null,
      creationStackTrace: stackTrace
    });
  }

  setConfiguration(
    id: ResourceId,
    configuration: GPUCanvasConfiguration | null
  ): void {
    this.getProperties(id).configuration = configuration;
  }

  serialize(id: ResourceId): SerializedGPUCanvasContext {
    const properties = this.getProperties(id);
    return {
      id,
      label: '',
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      errorMessage: properties.errorMessage,
      configuration: serialize(properties.configuration)
    };
  }
}

export const gpuCanvasContextManager = new GPUCanvasContextResourceManager();
