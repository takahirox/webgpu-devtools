import {
  getStackTraceAsString,
  //parseStackTraceString
} from "./utils/stacktrace";
import {
  cloneImageSourceAsImageData
} from "./utils/image";

// TODO: Don't unnecessarily hold WebGPU resources as much as possible not to block GC.
//       Using WeakMap/WeakSet and ResourceID where possible may be a good idea.
// TODO: Proper WebGPU error handling

type ResourceId = number;

class ResourceIdManager<T extends object> {
  private obj2id: WeakMap<T, ResourceId>;
  private id2obj: Map<ResourceId, T>;
  private count: number;

  constructor() {
    this.count = 0;
    this.obj2id = new WeakMap();
    this.id2obj = new Map();
  }

  allocate(obj: T): number {
    if (this.obj2id.has(obj)) {
      // Throw an error instead?
      return this.obj2id.get(obj);
    }

    const id = this.count;
    this.count++;
    this.obj2id.set(obj, id);
    this.id2obj.set(id, obj);
    return id;
  }

  deallocate(obj: T): void {
    if (!this.obj2id.has(obj)) {
      // Throw an error instead?
      return;
    }

    const id = this.obj2id.get(obj);
    this.obj2id.delete(obj);
    this.id2obj.delete(id);
  }

  getId(obj: T): number {
    if (!this.obj2id.has(obj)) {
      throw new Error(`Unknown object ${obj}`);
	}
    return this.obj2id.get(obj);
  }

  getObject(id: ResourceId): T {
    if (!this.id2obj.has(id)) {
      throw new Error(`Unknown id ${id}`);
	}
    return this.id2obj.get(id);
  }
}

type BaseProperties = {
  creationStackTrace: string;
  deletionStackTrace?: string;
};

abstract class BaseResourceManager<T extends object, U extends BaseProperties> {
  private idManager: ResourceIdManager<T>;
  private properties: Map<number, U>;

  constructor() {
    this.idManager = new ResourceIdManager();
    this.properties = new Map();
  }

  protected register(obj: T, properties: U): number {
    const id = this.idManager.allocate(obj);
    // TODO: Do deep copy the properties?
    this.properties.set(id, properties);
    return id;
  }

  delete(id: number): void {
    const obj = this.idManager.getObject(id);
    this.idManager.deallocate(obj);
    this.properties.delete(id);
  }

  getProperties(id: ResourceId): U {
    if (!this.properties.has(id)) {
      throw new Error(`Unknown ID ${id}`);
    }
    return this.properties.get(id);
  }

  getId(obj: T): ResourceId {
    return this.idManager.getId(obj);
  }
}

type GPUCanvasContextProperties = BaseProperties & {
  configuration: GPUCanvasConfiguration | null;
  options?: object;
};

class GPUCanvasContextResourceManager extends BaseResourceManager<GPUCanvasContext, GPUCanvasContextProperties> {
  add(obj: GPUCanvasContext, stackTrace: string, contextCreationOptions?: object): ResourceId {
    return this.register(obj, {
      configuration: null,
      creationStackTrace: stackTrace,
      options: contextCreationOptions
	});
  }

  setConfiguration(id: ResourceId, configuration: GPUCanvasConfiguration | null): void {
    this.getProperties(id).configuration = configuration;
  }
}

type GPUDeviceProperties = BaseProperties & {
  descriptor?: GPUDeviceDescriptor;
};

class GPUDeviceResourceManager extends BaseResourceManager<GPUDevice, GPUDeviceProperties> {
  add(obj: GPUDevice, stackTrace: string, descriptor?: GPUDeviceDescriptor): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor
    });
  }
}

type GPUBufferProperties = BaseProperties & {
  descriptor: GPUBufferDescriptor;
};

class GPUBufferResourceManager extends BaseResourceManager<GPUBuffer, GPUBufferProperties> {
  add(obj: GPUBuffer, stackTrace: string, descriptor: GPUBufferDescriptor): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor
    });
  }
}

type GPUTextureProperties = BaseProperties & {
  descriptor: GPUTextureDescriptor;
  isCanvasContextCurrentTexture: boolean;
};

class GPUTextureResourceManager extends BaseResourceManager<GPUTexture, GPUTextureProperties> {
  add(
    obj: GPUTexture,
    stackTrace: string,
    isCanvasContextCurrentTexture: boolean,
    // No descriptor if currentTexture
    descriptor?: GPUTextureDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor,
      isCanvasContextCurrentTexture: isCanvasContextCurrentTexture
    });
  }
}

type GPUTextureViewProperties = BaseProperties & {
  descriptor?: GPUTextureViewDescriptor;
  parentTexture: GPUTexture;
};

class GPUTextureViewResourceManager extends BaseResourceManager<GPUTextureView, GPUTextureViewProperties> {
  add(
    obj: GPUTextureView,
    stackTrace: string,
    parentTexture: GPUTexture,
    descriptor?: GPUTextureViewDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor,
      parentTexture: parentTexture
    });
  }
}

type GPUShaderModuleProperties = BaseProperties & {
  descriptor: GPUShaderModuleDescriptor;
};

class GPUShaderModuleResourceManager extends BaseResourceManager<GPUShaderModule, GPUShaderModuleProperties> {
  add(obj: GPUShaderModule, stackTrace: string, descriptor: GPUShaderModuleDescriptor): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor
    });
  }
}

type GPURenderPipelineProperties = BaseProperties & {
  descriptor: GPURenderPipelineDescriptor;
};

class GPURenderPipelineResourceManager extends BaseResourceManager<GPURenderPipeline, GPURenderPipelineProperties> {
  add(obj: GPURenderPipeline, stackTrace: string, descriptor: GPURenderPipelineDescriptor): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor
    });
  }
}

enum EncoderState {
  open,
  locked,
  ended
};

type GPUCommandEncoderProperties = BaseProperties & {
  descriptor?: GPUCommandEncoderDescriptor;
  renderPasses: GPURenderPassEncoder[];
  state: EncoderState;
};

// TODO: We shouldn't record the resources that can created every frame?
class GPUCommandEncoderResourceManager extends BaseResourceManager<GPUCommandEncoder, GPUCommandEncoderProperties> {
  add(obj: GPUCommandEncoder, stackTrace: string, descriptor?: GPUCommandEncoderDescriptor): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor,
      renderPasses: [],
      state: EncoderState.open
    });
  }

  setState(id: ResourceId, state: EncoderState): void {
    this.getProperties(id).state = state;
  }

  addRenderPass(id: ResourceId, renderPass: GPURenderPassEncoder): void {
    this.getProperties(id).renderPasses.push(renderPass);
  }
}

type GPUCommandBufferProperties = BaseProperties & {
  descriptor?: GPUCommandBufferDescriptor;
  parentEncoder: GPUCommandEncoder;
};

class GPUCommandBufferResourceManager extends BaseResourceManager<GPUCommandBuffer, GPUCommandBufferProperties> {
  add(
    obj: GPUCommandBuffer,
    stackTrace: string,
    parentEncoder: GPUCommandEncoder,
    descriptor?: GPUCommandBufferDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor,
      parentEncoder: parentEncoder
    });
  }
}

type GPURenderPassEncoderProperties = BaseProperties & {
  descriptor: GPURenderPassDescriptor;
  parentEncoder: GPUCommandEncoder,
  state: EncoderState,
  viewport: {
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number
  } | null;
};

class GPURenderPassEncoderResourceManager extends BaseResourceManager<GPURenderPassEncoder, GPURenderPassEncoderProperties> {
  add(
    obj: GPURenderPassEncoder,
    stackTrace: string,
    parentEncoder: GPUCommandEncoder,
    descriptor: GPURenderPassDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      descriptor: descriptor,
      parentEncoder: parentEncoder,
      state: EncoderState.open,
      viewport: null
    });
  }

  setViewport(
    id: ResourceId,
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number
  ): void {
    this.getProperties(id).viewport = {
      x: x,
      y: y,
      width: width,
      height: height,
      minDepth: minDepth,
      maxDepth: maxDepth
	};
  }

  setState(id: ResourceId, state: EncoderState): void {
    this.getProperties(id).state = state;
  }
}

// TODO: Avoid any
type History = {
  args?: any[];
  name: string;
  stackTrace: string;
};

class HistoryManager {
  private histories: History[];

  constructor() {
    this.histories = [];
  }

  add(name: string, stackTrace: string, args?: any[]) {
    this.histories.push({
      args: args,
      name: name,
      stackTrace: stackTrace
    });
  }

/*
  private dumpHistory(history: History) {
    let str = '';
    str += `${history.name}\n`;
    if (history.args !== undefined) {
      for (let i = 0; i < history.args.length; i++) {
        str += `${i}: ${stringify(history.args[i])}\n`;
      }
    }
    str += `${parseStackTraceString(history.stackTrace)}\n`;
    console.log(str);
    dispatchCustomEvent('webgpu-devtools-function-call', {
      name: history.name
    });
  }
*/
}

const stringify = (value: string | number | any[] | Object | null | undefined ): string => {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (typeof value === 'number') {
    return `${value}`;
  }
  if (Array.isArray(value)) {
    let str = '[\n'; 
    for (let i = 0; i < value.length; i++) {
      str += `${i}: ${stringify(value[i])}\n`;
    }
    str += ']\n';
    return str;	  
  }
  if (typeof value === 'object') {
    let str = '{\n'; 
    for (const key in value) {
      // TODO: Avoid any
      str += `${key}: ${stringify((value as any)[key])}\n`;
    }
    str += '}\n';
    return str;	  
  }
  return `${value}`;
};

type DrawCountStatistics = {
  drawCallCount: number;
  drawnPolygons: number;
};

class StatisticsAnalyzer {
  private drawCallCount: number;
  private drawnPolygons: number;

  constructor() {
    this.drawCallCount = 0;
    this.drawnPolygons = 0;
  }

  // Expectes "triangle-list" for now.
  // TODO: Fix it. Should be based on primitive topology
  // TODO: Take into account instanceCount
  draw(vertexCount: number, _instanceCount: number): void {
    this.drawCallCount++;
    this.drawnPolygons = vertexCount / 3;
  }

  drawIndexed(indexCount: number, _instanceCount: number): void {
    this.drawCallCount++;
    this.drawnPolygons = indexCount / 3;
  }

  getDrawCountStatistics(): DrawCountStatistics {
    return {
      drawCallCount: this.drawCallCount,
      drawnPolygons: this.drawnPolygons
    };
  }
}

// TODOs:
//   - Track the WebGPU resources
//   - Better dump
//   - buffer and draw call analysis
//   - Display texture image and frame(drawing) buffer

// TODO: Avoid any
const dispatchCustomEvent = (type: string, detail: any) => {
  window.dispatchEvent(new CustomEvent(type, {
    // TODO: use cloneInto for Firefox
    detail: detail
  }));
};

const contextManager = new GPUCanvasContextResourceManager();
const deviceManager = new GPUDeviceResourceManager();
const bufferManager = new GPUBufferResourceManager();
const textureManager = new GPUTextureResourceManager();
const textureViewManager = new GPUTextureViewResourceManager();
const shaderModuleManager = new GPUShaderModuleResourceManager();
const renderPipelineManager = new GPURenderPipelineResourceManager();
const renderPassManager = new GPURenderPassEncoderResourceManager();
const commandEncoderManager = new GPUCommandEncoderResourceManager();
const commandBufferManager = new GPUCommandBufferResourceManager();
const historyManager = new HistoryManager();
const statisticsAnalyzer = new StatisticsAnalyzer();

const textureProperties = new WeakMap<GPUTexture, {
  imageData: ImageData | null
}>();

const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextType: string, contextAttributes?: Object) {
  if (contextType !== 'webgpu') {
    return originalGetContext.call(this, contextType, contextAttributes);
  }

  const args = [];
  args.push(contextType);
  if (contextAttributes !== undefined) {
    args.push(contextAttributes);
  }
  const stackTrace = getStackTraceAsString(this.getContext);
  historyManager.add('HTMLCanvasElement.getContext', stackTrace, args);
  const context = originalGetContext.call(this, contextType, contextAttributes);
  contextManager.add(context, stackTrace, contextAttributes);
  return context;
};

const originalOffscreenCanvasGetContext = OffscreenCanvas.prototype.getContext;
OffscreenCanvas.prototype.getContext = function (contextType: string, contextAttributes?: Object) {
  if (contextType !== 'webgpu') {
    return originalOffscreenCanvasGetContext.call(this, contextType, contextAttributes);
  }

  const args = [];
  args.push(contextType);
  if (contextAttributes !== undefined) {
    args.push(contextAttributes);
  }
  const stackTrace = getStackTraceAsString(this.getContext);
  historyManager.add('OffscreenCanvas.getContext', stackTrace, args);
  const context = originalGetContext.call(this, contextType, contextAttributes);
  contextManager.add(context, stackTrace, contextAttributes);
  return context;
};

const originalConfigure = GPUCanvasContext.prototype.configure;
GPUCanvasContext.prototype.configure = function (configuration: GPUCanvasConfiguration) {
  const args = [];
  args.push(configuration);
  historyManager.add('GPUCanvasContext.configure', getStackTraceAsString(this.configure), args);
  contextManager.setConfiguration(contextManager.getId(this), configuration);
  return originalConfigure.call(this, configuration);
};

const originalUnconfigure = GPUCanvasContext.prototype.unconfigure;
GPUCanvasContext.prototype.unconfigure = function () {
  historyManager.add('GPUCanvasContext.unconfigure', getStackTraceAsString(this.unconfigure));
  return originalUnconfigure.call(this);
};

const originalGetCurrentTexture = GPUCanvasContext.prototype.getCurrentTexture;
GPUCanvasContext.prototype.getCurrentTexture = function () {
  const stackTrace = getStackTraceAsString(this.getCurrentTexture);
  historyManager.add('GPUCanvasContext.getCurrentTexture', stackTrace);
  const texture = originalGetCurrentTexture.call(this);
  textureManager.add(texture, stackTrace, true);
  return texture;
};

const originalRequestAdapter = GPU.prototype.requestAdapter;
GPU.prototype.requestAdapter = function (options?: Object) {
  const args = [];
  if (options !== undefined) {
    args.push(options);
  }
  historyManager.add('GPU.requestAdapter', getStackTraceAsString(this.requestAdapter), args);
  return originalRequestAdapter.call(this, options);	
};

const originalRequestDevice = GPUAdapter.prototype.requestDevice;
GPUAdapter.prototype.requestDevice = function (descriptor?: GPUDeviceDescriptor) {
  const args = [];
  if (descriptor !== undefined) {
    args.push(descriptor);
  }
  const stackTrace = getStackTraceAsString(this.requestDevice);
  historyManager.add('GPUAdapter.requestDevice', stackTrace, args);
  const promise = originalRequestDevice.call(this, descriptor);
  promise.then((device: GPUDevice) => {
    deviceManager.add(device, stackTrace, descriptor);
  });
  return promise;
};

const originalBeginRenderPass = GPUCommandEncoder.prototype.beginRenderPass;
GPUCommandEncoder.prototype.beginRenderPass = function (descriptor: GPURenderPassDescriptor) {
  const args = [];
  args.push(descriptor);

  const stackTrace = getStackTraceAsString(this.beginRenderPass);
  historyManager.add('GPUCommandEncoder.beginRenderPass', stackTrace, args);

  const renderPass = originalBeginRenderPass.call(this, descriptor);
  renderPassManager.add(renderPass, stackTrace, this, descriptor);

  const commandEncoderId = commandEncoderManager.getId(this);
  commandEncoderManager.setState(commandEncoderId, EncoderState.locked);
  commandEncoderManager.addRenderPass(commandEncoderId, renderPass);

  return renderPass;
};

const originalFinish = GPUCommandEncoder.prototype.finish;
GPUCommandEncoder.prototype.finish = function (descriptor?: GPUCommandEncoderDescriptor) {
  const args = [];
  if (descriptor !== undefined) {
    args.push(descriptor);
  }
  const stackTrace = getStackTraceAsString(this.finish);
  historyManager.add('GPUCommandEncoder.finish', stackTrace, args);
  const commandBuffer = originalFinish.call(this, descriptor);
  commandBufferManager.add(commandBuffer, stackTrace, this, descriptor);
  return commandBuffer;
};

const originalSetPipeline = GPURenderPassEncoder.prototype.setPipeline;
GPURenderPassEncoder.prototype.setPipeline = function (pipeline: GPURenderPipeline) {
  const args = [];
  args.push(pipeline);
  const stackTrace = getStackTraceAsString(this.setPipeline);
  historyManager.add('GPURenderPassEncoder.setPipeline', stackTrace, args);
  return originalSetPipeline.call(this, pipeline);
};

const originalSetIndexBuffer = GPURenderPassEncoder.prototype.setIndexBuffer;
GPURenderPassEncoder.prototype.setIndexBuffer = function (
  buffer: GPUBuffer,
  indexFormat: GPUIndexFormat,
  offset?: number,
  size?: number
) {
  const args = [];
  args.push(buffer);
  args.push(indexFormat);
  if (offset !== undefined) {
    args.push(offset);
  }
  if (size !== undefined) {
    args.push(size);
  }
  const stackTrace = getStackTraceAsString(this.setIndexBuffer);
  historyManager.add('GPURenderPassEncoder.setIndexBuffer', stackTrace, args);
  return originalSetIndexBuffer.call(this, buffer, indexFormat, offset, size);
};

const originalSetVertexBuffer = GPURenderPassEncoder.prototype.setVertexBuffer;
GPURenderPassEncoder.prototype.setVertexBuffer = function (
  slot: number,
  buffer: GPUBuffer,
  offset? : number,
  size?: number
) {
  const args = [];
  args.push(slot);
  args.push(buffer);
  if (offset !== undefined) {
    args.push(offset);
  }
  if (size !== undefined) {
    args.push(size);
  }
  const stackTrace = getStackTraceAsString(this.setVertexBuffer);
  historyManager.add('GPURenderPassEncoder.setVertexBuffer', stackTrace, args);
  return originalSetVertexBuffer.call(this, slot, buffer, offset, size)
};

const originalDraw = GPURenderPassEncoder.prototype.draw;
GPURenderPassEncoder.prototype.draw = function (
  vertexCount: number,
  instanceCount?: number,
  firstVertex?: number,
  firstInstance?: number
) {
  const args = [];
  args.push(vertexCount);
  if (instanceCount !== undefined) {
    args.push(instanceCount);
  }
  if (firstVertex !== undefined) {
    args.push(firstVertex);
  }
  if (firstInstance !== undefined) {
    args.push(firstInstance);
  }
  const stackTrace = getStackTraceAsString(this.draw);
  historyManager.add('GPURenderPassEncoder.draw', stackTrace, args);
  statisticsAnalyzer.draw(vertexCount, instanceCount);
  return originalDraw.call(this, vertexCount, instanceCount, firstVertex, firstInstance);
};

const originalDrawIndexed = GPURenderPassEncoder.prototype.drawIndexed;
GPURenderPassEncoder.prototype.drawIndexed = function (
  indexCount: number,
  instanceCount?: number,
  firstIndex?: number,
  baseVertex?: number,
  firstInstance?: number
) {
  const args = [];
  args.push(indexCount);
  if (instanceCount !== undefined) {
    args.push(instanceCount);
  }
  if (firstIndex !== undefined) {
    args.push(firstIndex);
  }
  if (baseVertex !== undefined) {
    args.push(baseVertex);
  }
  if (firstInstance !== undefined) {
    args.push(firstInstance);
  }
  const stackTrace = getStackTraceAsString(this.drawIndexed);
  historyManager.add('GPURenderPassEncoder.drawIndexed', stackTrace, args);
  statisticsAnalyzer.drawIndexed(indexCount, instanceCount);
  return originalDrawIndexed.call(this, indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
};

const originalSetViewport = GPURenderPassEncoder.prototype.setViewport;
GPURenderPassEncoder.prototype.setViewport = function(
  x: number,
  y: number,
  width: number,
  height: number,
  minDepth: number,
  maxDepth: number
) {
  const args = [];
  args.push(x);
  args.push(y);
  args.push(width);
  args.push(height);
  args.push(minDepth);
  args.push(maxDepth);
  const stackTrace = getStackTraceAsString(this.setViewport);
  historyManager.add('GPURenderPassEncoder.setViewport', stackTrace, args);
  renderPassManager.setViewport(
    renderPassManager.getId(this),
    x,
    y,
    width,
    height,
    minDepth,
    maxDepth
  );
  return originalSetViewport.call(this, x, y, width, height, minDepth, maxDepth);
};

const originalEnd = GPURenderPassEncoder.prototype.end;
GPURenderPassEncoder.prototype.end = function () {
  historyManager.add('GPURenderPassEncoder.end', getStackTraceAsString(this.end));
  const result = originalEnd.call(this);
  const { parentEncoder } = renderPassManager.getProperties(renderPassManager.getId(this));
  commandEncoderManager.setState(
    commandEncoderManager.getId(parentEncoder),
    EncoderState.open
  );
  return result;
};

const originalSubmit = GPUQueue.prototype.submit;
GPUQueue.prototype.submit = function (commandBuffers: GPUCommandBuffer[]) {
  const args = [];
  args.push(commandBuffers);
  historyManager.add('GPUQueue.submit', getStackTraceAsString(this.submit), args);
  const result = originalSubmit.call(this, commandBuffers);

  const textures = new Set<GPUTexture>();
  for (const buffer of commandBuffers) {
    const { parentEncoder } = commandBufferManager.getProperties(commandBufferManager.getId(buffer));
    const { renderPasses } = commandEncoderManager.getProperties(commandEncoderManager.getId(parentEncoder));
    for (const pass of renderPasses) {
      const { descriptor } = renderPassManager.getProperties(renderPassManager.getId(pass));
      const { colorAttachments } = descriptor;
      for (const attachment of colorAttachments) {
        const { view, resolveTarget } = attachment;
        textures.add(textureViewManager.getProperties(textureViewManager.getId(view)).parentTexture);
        if (resolveTarget !== undefined) {
          textures.add(textureViewManager.getProperties(textureViewManager.getId(resolveTarget)).parentTexture);
        }
      }
    }
  }

  this.onSubmittedWorkDone().then(() => {
    console.log(textures);
  });

  return result;
};

const originalWriteBuffer = GPUQueue.prototype.writeBuffer;
GPUQueue.prototype.writeBuffer = function(
  buffer: GPUBuffer,
  bufferOffset: number,
  data: BufferSource,
  dataOffset?: number,
  size?: number
) {
  const args = [];
  args.push(buffer);
  args.push(bufferOffset);
  args.push(data);

  if (dataOffset !== undefined) {
    args.push(dataOffset);
  }
  if (size !== undefined) {
    args.push(size);
  }
  historyManager.add('GPUQueue.writeBuffer', getStackTraceAsString(this.writeBuffer), args);

  dispatchCustomEvent('webgpu-devtools-buffer-data', {
    data: data
  });

  return originalWriteBuffer.call(this, buffer, bufferOffset, data, dataOffset, size);
};

const originalWriteTexture = GPUQueue.prototype.writeTexture;
GPUQueue.prototype.writeTexture = function(
  destination: GPUImageCopyTexture,
  data: BufferSource,
  dataLayout: GPUImageDataLayout,
  size: GPUExtent3D
) {
  const args = [];
  args.push(destination);
  args.push(data);
  args.push(dataLayout);
  args.push(size);
  historyManager.add('GPUQueue.writeTexture', getStackTraceAsString(this.writeTexture), args);
  return originalWriteTexture.call(this, destination, data, dataLayout, size);
};

const originalCopyExternalImageToTexture = GPUQueue.prototype.copyExternalImageToTexture;
GPUQueue.prototype.copyExternalImageToTexture = function (
  source: GPUImageCopyExternalImage,
  destination: GPUImageCopyTextureTagged,
  copySize: GPUExtent3DStrict) {
  const args = [];
  args.push(source);
  args.push(destination);
  args.push(copySize);
  historyManager.add('GPUQueue.copyExternalImageToTexture', getStackTraceAsString(this.copyExternalImageToTexture), args);

  const imageData = cloneImageSourceAsImageData(source.source);

  const texture = destination.texture;

  textureProperties.get(texture)!.imageData = imageData;
  console.log(textureProperties);
  dispatchCustomEvent('webgpu-devtools-texture-image', {
    imageData: imageData
  });

  return originalCopyExternalImageToTexture.call(this, source, destination, copySize);
};

const originalCreateShaderModule = GPUDevice.prototype.createShaderModule;
GPUDevice.prototype.createShaderModule = function (descriptor: GPUShaderModuleDescriptor) {
  const args = [];
  args.push(descriptor);
  const stackTrace = getStackTraceAsString(this.createShaderModule);
  historyManager.add('GPUDevice.createShaderModule', stackTrace, args);
  const shaderModule = originalCreateShaderModule.call(this, descriptor);
  shaderModuleManager.add(shaderModule, stackTrace, descriptor);
  return shaderModule;
};

const originalCreateBuffer = GPUDevice.prototype.createBuffer;
GPUDevice.prototype.createBuffer = function (descriptor: GPUBufferDescriptor) {
  const args = [];
  args.push(descriptor);
  const stackTrace = getStackTraceAsString(this.createBuffer);
  historyManager.add('GPUDevice.createBuffer', stackTrace, args);
  const buffer = originalCreateBuffer.call(this, descriptor);
  bufferManager.add(buffer, stackTrace, descriptor);
  return buffer;
};

const originalCreateRenderPipeline = GPUDevice.prototype.createRenderPipeline;
GPUDevice.prototype.createRenderPipeline = function (descriptor: GPURenderPipelineDescriptor) {
  const args = [];
  args.push(descriptor);
  const stackTrace = getStackTraceAsString(this.createRenderPipeline);
  historyManager.add('GPUDevice.createRenderPipeline', stackTrace, args);
  const pipeline = originalCreateRenderPipeline.call(this, descriptor);
  renderPipelineManager.add(pipeline, stackTrace, descriptor);
  return pipeline;
};

const originalCreateRenderPipelineAsync = GPUDevice.prototype.createRenderPipelineAsync;
GPUDevice.prototype.createRenderPipelineAsync = function (descriptor: GPURenderPipelineDescriptor) {
  const args = [];
  args.push(descriptor);
  const stackTrace = getStackTraceAsString(this.createRenderPipelineAsync);
  historyManager.add('GPUDevice.createRenderPipelineAsync', stackTrace, args);
  const promise = originalCreateRenderPipelineAsync.call(this, descriptor);
  promise.then((pipeline: GPURenderPipeline) => {
    renderPipelineManager.add(pipeline, stackTrace, descriptor);
  });
  return promise;
};

const originalCreateCommandEncoder = GPUDevice.prototype.createCommandEncoder;
GPUDevice.prototype.createCommandEncoder = function (descriptor?: GPUCommandEncoderDescriptor) {
  const args = [];
  if (descriptor !== undefined) {
    args.push(descriptor);
  }
  const stackTrace = getStackTraceAsString(this.createCommandEncoder);
  historyManager.add('GPUDevice.createCommandEncoder', stackTrace, args);
  const encoder = originalCreateCommandEncoder.call(this, descriptor);
  commandEncoderManager.add(encoder, stackTrace, descriptor);
  return encoder;
};

const originalCreateTexture = GPUDevice.prototype.createTexture;
GPUDevice.prototype.createTexture = function (descriptor: GPUTextureDescriptor) {
  // TODO: Write comment and concern
  descriptor.usage |= GPUTextureUsage.COPY_SRC;

  const args = [];
  args.push(descriptor);
  const stackTrace = getStackTraceAsString(this.createTexture);
  historyManager.add('GPUDevice.createTexture', stackTrace, args);
  const texture = originalCreateTexture.call(this, descriptor);
  textureManager.add(texture, stackTrace, false, descriptor);
  textureProperties.set(texture, {
    imageData: null	  
  });
  return texture;
};

const originalImportExternalTexture = GPUDevice.prototype.importExternalTexture;
GPUDevice.prototype.importExternalTexture = function (descriptor: Object) {
  const args = [];
  args.push(descriptor);
  historyManager.add('GPUDevice.importExternalTexture', getStackTraceAsString(this.importExternalTexture), args);
  const texture = originalImportExternalTexture.call(this, descriptor);
  return texture;	
};

const originalDestroyBuffer = GPUBuffer.prototype.destroy;
GPUBuffer.prototype.destroy = function () {
  historyManager.add('GPUDevice.createBuffer', getStackTraceAsString(this.destroy));
  bufferManager.delete(bufferManager.getId(this));
  return originalDestroyBuffer.call(this);
};

const originalCreateView = GPUTexture.prototype.createView;
GPUTexture.prototype.createView = function (descriptor?: Object) {
  const args = [];
  if (descriptor !== undefined) {
    args.push(descriptor);
  }
  const stackTrace = getStackTraceAsString(this.createView);
  historyManager.add('GPUTexture.createView', stackTrace, args);
  const view = originalCreateView.call(this, descriptor);
  textureViewManager.add(view, stackTrace, this, descriptor);
  return view;
};

const originalDestroyTexture = GPUTexture.prototype.destroy;
GPUTexture.prototype.destroy = function () {
  historyManager.add('GPUTexture.destroy', getStackTraceAsString(this.destroy));
  textureManager.delete(textureManager.getId(this));
  textureProperties.delete(this);
  return originalDestroyTexture.call(this);
};
