import { callFunction, callFunctionAsync } from "./base";
import { gpuBufferManager } from "../resource_managers/gpu_buffer";
import { getStackTraceAsString } from "../utils/stacktrace";

export const {
  mapAsync: GPUBuffer_mapAsync,
  getMappedRange: GPUBuffer_getMappedRange,
  unmap: GPUBuffer_unmap,
  destroy: GPUBuffer_destroy
} = GPUBuffer.prototype;

function mapAsync(
  this: GPUBuffer,
  mode: GPUMapModeFlags,
  offset?: number,
  size?: number
): Promise<undefined> {
  const stackTrace = getStackTraceAsString(mapAsync);

  return callFunctionAsync<undefined>(
    this,
    GPUBuffer_mapAsync,
    'GPUBuffer.mapAsync',
    arguments,
    stackTrace,
    () => {
      const id = gpuBufferManager.getId(this);
      const properties = gpuBufferManager.getProperties(id);
      const mapOffset = offset !== undefined ? offset : 0;
      const bufferSize = properties.content.byteLength;
      const mapSize = size !== undefined ? size : bufferSize - mapOffset;
      gpuBufferManager.setMapMode(
        gpuBufferManager.getId(this),
        mode,
        mapOffset,
        mapSize
      );
    }
  );
}

function getMappedRange(
  this: GPUBuffer,
  offset?: number
): ArrayBuffer {
  const stackTrace = getStackTraceAsString(getMappedRange);

  return callFunction<ArrayBuffer>(
    this,
    GPUBuffer_getMappedRange,
    'GPUBuffer.getMappedRange',
    arguments,
    stackTrace,
    (arraybuffer: ArrayBuffer) => {
      const { mapMode } = gpuBufferManager.getProperties(gpuBufferManager.getId(this));
      if (mapMode & GPUMapMode.WRITE) {
        const id = gpuBufferManager.getId(this);
        gpuBufferManager.addWriteMappedView(id, arraybuffer, offset);
      }
    }
  );
}

function unmap(
  this: GPUBuffer
): undefined {
  const stackTrace = getStackTraceAsString(unmap);

  const id = gpuBufferManager.getId(this);
  gpuBufferManager.unmap(id);

  return callFunction<undefined>(
    this,
    GPUBuffer_unmap,
    'GPUBuffer.unmap',
    arguments,
    stackTrace,
    () => {
      gpuBufferManager.commitUnmap(id);
    },
    () => {
      gpuBufferManager.rollbackUnmap(id);
    }
  );
}

function destroy(
  this: GPUBuffer
): undefined {
  const stackTrace = getStackTraceAsString(destroy);

  return callFunction<undefined>(
    this,
    GPUBuffer_destroy,
    'GPUBuffer.destroy',
    arguments,
    stackTrace,
    () => {
      const id = gpuBufferManager.getId(this);
      gpuBufferManager.unmap(id);
      gpuBufferManager.destroy(id);
    }
  );
}

export class GPUBufferHook {
  static override(): void {
    GPUBuffer.prototype.mapAsync = mapAsync;
    GPUBuffer.prototype.getMappedRange = getMappedRange;
    GPUBuffer.prototype.unmap = unmap;
    GPUBuffer.prototype.destroy = destroy;
  }

  static restore(): void {
    GPUBuffer.prototype.mapAsync = GPUBuffer_mapAsync;
    GPUBuffer.prototype.getMappedRange = GPUBuffer_getMappedRange;
    GPUBuffer.prototype.unmap = GPUBuffer_unmap;
    GPUBuffer.prototype.destroy = GPUBuffer_destroy;
  }
}
