import { type ResourceId } from "../common/constants";
import { type SerializedTexture } from "../common/messages";
import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { deepCopy } from "../utils/copy";

type GPUTextureProperties = BaseProperties & {
  // Defined only if texture is created with conetxt.getCurrentTexture()
  canvasContext?: GPUCanvasContext;
  // Undefined if texture is created with conetxt.getCurrentTexture()
  descriptor?: GPUTextureDescriptor | GPUExternalTextureDescriptor;
  content?: ImageData;
};

// TODO: Avoid Object

const serializeGPUTextureDescriptor = (
  descriptor: GPUTextureDescriptor
): Object => {
  return deepCopy(descriptor);
};

// TODO: Implement
const serializeGPUExternalTextureDescriptor = (
  descriptor: GPUExternalTextureDescriptor
): Object => {
  return Object.assign({}, descriptor);
};

// TODO: Rewrite more elegantly if possible
const isGPUExternalTextureDescriptor = (
  descriptor: GPUTextureDescriptor | GPUExternalTextureDescriptor
): boolean => {
  // source is required property in GPUExternalTextureDescriptor while
  // it doesn't exist in GPUTextureDescriptor
  return (descriptor as GPUExternalTextureDescriptor).source !== undefined;
};

const serializeDescriptor = (
  descriptor?: GPUTextureDescriptor | GPUExternalTextureDescriptor
): Object | undefined => {
  if (descriptor === undefined) {
    return undefined;
  }
  if (isGPUExternalTextureDescriptor(descriptor)) {
    return serializeGPUExternalTextureDescriptor(descriptor as GPUExternalTextureDescriptor);
  } else {
    return serializeGPUTextureDescriptor(descriptor as GPUTextureDescriptor);
  }
};

class GPUTextureResourceManager
  extends BaseResourceManager<GPUTexture, GPUTextureProperties> {
  add(
    obj: GPUTexture,
    stackTrace: string[],
    descriptor: GPUTextureDescriptor | GPUExternalTextureDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor
    });
  }

  addCanvasTexture(
    obj: GPUTexture,
    stackTrace: string[],
    canvasContext: GPUCanvasContext
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      canvasContext
    });
  }

  setContent(id: ResourceId, content: ImageData): void {
    // TODO: Should we save old content?
    this.getProperties(id).content = content;
  }

  isFrameBuffer(id: ResourceId): boolean {
    return this.getProperties(id).canvasContext !== undefined;
  }

  serialize(id: ResourceId): SerializedTexture {
    const texture = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id: id,
      label: texture.label,
      descriptor: serializeDescriptor(properties.descriptor),
      width: texture.width,
      height: texture.height,
      depthOrArrayLayers: texture.depthOrArrayLayers,
      mipLevelCount: texture.mipLevelCount,
      sampleCount: texture.sampleCount,
      dimension: texture.dimension,
      format: texture.format,
      usage: texture.usage,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      destroyed: properties.destroyed,
      errorMessage: properties.errorMessage,
      content: properties.content
    };
  }
}

export const gpuTextureManager = new GPUTextureResourceManager();
