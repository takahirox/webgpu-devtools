import { type ResourceId } from "../common/constants";
import { type SerializedBuffer } from "../common/messages";
import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { deepCopy } from "../utils/copy";

type WriteMappedView = {
  arraybuffer: ArrayBuffer,
  offset?: number;
};

type GPUBufferProperties = BaseProperties & {
  content: ArrayBuffer;
  descriptor: GPUBufferDescriptor;
  mapMode: GPUMapModeFlags;
  mapOffset: number;
  mapSize: number;
  writeMappedViews: WriteMappedView[];
  copiedWriteBuffers: ArrayBuffer[];
};

class GPUBufferResourceManager
  extends BaseResourceManager<GPUBuffer, GPUBufferProperties> {
  add(
    obj: GPUBuffer,
    stackTrace: string[],
    descriptor: GPUBufferDescriptor
  ): ResourceId {
    return this.register(obj, {
      content: new ArrayBuffer(descriptor.size),
      creationStackTrace: stackTrace,
      // TODO: Remove cast if possible
      descriptor: deepCopy(descriptor) as GPUBufferDescriptor,
	  mapMode: 0,
      mapOffset: 0,
	  mapSize: 0,
      writeMappedViews: [],
      copiedWriteBuffers: []
    });
  }

  setMapMode(
    id: ResourceId,
    mapMode: GPUMapModeFlags,
    offset: number,
    size: number
  ): void {
    const properties = this.getProperties(id);
    properties.mapMode = mapMode;
    properties.mapOffset = offset;
    properties.mapSize = size;
  }

  addWriteMappedView(
    id: ResourceId,
    arraybuffer: ArrayBuffer,
    offset?: number
  ): void {
    const properties = this.getProperties(id);
    properties.writeMappedViews.push({
      arraybuffer,
      offset
    });
  }

  unmap(id: ResourceId): void {
    const properties = this.getProperties(id);
    // TODO: Write comment why we need two steps, unmap and then commit/rollback.
    // TODO: Think of more efficient way if possible
    for (const view of properties.writeMappedViews) {
      properties.copiedWriteBuffers.push(view.arraybuffer.slice(0));
    }
  }

  commitUnmap(id: ResourceId): void {
    const properties = this.getProperties(id);

    const {
      mapOffset,
      copiedWriteBuffers,
      writeMappedViews
    } = properties;
    for (let i = 0; i < copiedWriteBuffers.length; i++) {
      const arraybuffer = copiedWriteBuffers[i];
      const rangeOffset = writeMappedViews[i].offset || 0;
      const offset = mapOffset + rangeOffset;
      this.updateContent(id, arraybuffer, offset, 0, arraybuffer.byteLength);
    }

    properties.mapMode = 0;
    properties.mapOffset = 0;
    properties.mapSize = 0;
    copiedWriteBuffers.length = 0;
    writeMappedViews.length = 0;
  }

  rollbackUnmap(id: ResourceId): void {
    const properties = this.getProperties(id);
    properties.copiedWriteBuffers.length = 0;
  }

  updateContent(
    id: ResourceId,
    buffer: ArrayBuffer,
    dstOffset: number,
    srcOffset: number,
    size: number
  ): void {
    // TODO: Should we save old content to manage history?
    const { content } = this.getProperties(id);
    // Any more efficient way?
    const dst = new Uint8Array(content);
    const src = new Uint8Array(buffer);
    for (let i = 0; i < size; i++) {
      dst[dstOffset + i] = src[srcOffset + i];
    }
  }

  serialize(id: ResourceId): SerializedBuffer {
    const buffer = this.getObject(id);
    const properties = this.getProperties(id);
    return {
      id: id,
      label: buffer.label,
      alive: true, // TODO: Implement properly
      descriptor: properties.descriptor,
      size: buffer.size,
      usage: buffer.usage,
      mapState: buffer.mapState,
      creationFrameNum: properties.creationFrameNum,
      creationStackTrace: properties.creationStackTrace,
      destroyed: properties.destroyed,
      errorMessage: properties.errorMessage,
      content: properties.content
    };
  }
}

export const gpuBufferManager = new GPUBufferResourceManager();
