import {
  getStackTraceAsString,
  parseStackTraceString
} from "./utils/stacktrace";
import {
  cloneImageSourceAsImageData
} from "./utils/image";

// TODOs:
//   - Track the WebGPU resources
//   - Better dump
//   - buffer and draw call analysis
//   - Display texture image and frame(drawing) buffer

const dispatchCustomEvent = (type, detail) => {
  window.dispatchEvent(new CustomEvent(type, {
    // TODO: use cloneInto for Firefox
    detail: detail
  }));
};

const deviceSet = new WeakSet<GPUDevice>();
const bufferSet = new WeakSet<GPUBuffer>();
const textureSet = new WeakSet<GPUTexture>();
// TODO: Avoid Object
const textureProperties = new WeakMap<GPUTexture, {
  imageData: ImageData | null	
}>();

// TODO: Avoid any
type History = {
  name: string;	
  args?: any[];
  stackTrace: string;
};

const histories: History[] = [];
const addHistory = (functionName: string, stackTrace: string, args?: any[]): void => {
  const history: History = {
    name: functionName,
    args: args,
    stackTrace: stackTrace
  };
  if (histories.length < 1000) {
    dumpHistory(history);
  }
  histories.push(history);
};

const dumpHistory = (history: History) => {
  let str = '';
  str += `${history.name}\n`;
  if (history.args !== undefined) {
    for (let i = 0; i < history.args.length; i++) {
      str += `${i}: ${stringify(history.args[i])}\n`;
    }
  }
  str += `${parseStackTraceString(history.stackTrace)}\n`;
  //console.log(str);
  dispatchCustomEvent('webgpu-devtools-function-call', {
    name: history.name
  });
};

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
      str += `${key}: ${stringify(value[key])}\n`;
    }
    str += '}\n';
    return str;	  
  }
  return `${value}`;
};

const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextType: string, contextAttributes?: Object) {
  const args = [];
  args.push(contextType);
  if (contextAttributes !== undefined) {
    args.push(Object.assign({}, contextAttributes));
  }
  addHistory('HTMLCanvasElement.getContext', getStackTraceAsString(this.getContext), args);
  return originalGetContext.call(this, contextType, contextAttributes);
};

const originalOffscreenCanvasGetContext = OffscreenCanvas.prototype.getContext;
OffscreenCanvas.prototype.getContext = function (contextType: string, contextAttributes?: Object) {
  const args = [];
  args.push(contextType);
  if (contextAttributes !== undefined) {
    args.push(Object.assign({}, contextAttributes));
  }
  addHistory('OffscreenCanvas.getContext', getStackTraceAsString(this.getContext), args);
  return originalGetContext.call(this, contextType, contextAttributes);
};

const originalConfigure = GPUCanvasContext.prototype.configure;
GPUCanvasContext.prototype.configure = function (configuration: Object) {
  const args = [];
  args.push(configuration);
  addHistory('GPUCanvasContext.configure', getStackTraceAsString(this.configure), args);
  return originalConfigure.call(this, configuration);
};

const originalUnconfigure = GPUCanvasContext.prototype.unconfigure;
GPUCanvasContext.prototype.unconfigure = function () {
  addHistory('GPUCanvasContext.unconfigure', getStackTraceAsString(this.unconfigure));
  return originalUnconfigure.call(this);
};

const originalGetCurrentTexture = GPUCanvasContext.prototype.getCurrentTexture;
GPUCanvasContext.prototype.getCurrentTexture = function () {
  addHistory('GPUCanvasContext.getCurrentTexture', getStackTraceAsString(this.getCurrentTexture));
  return originalGetCurrentTexture.call(this);
};

const originalRequestAdapter = GPU.prototype.requestAdapter;
GPU.prototype.requestAdapter = function (options?: Object) {
  const args = [];
  if (options !== undefined) {
    args.push(options);
  }
  addHistory('GPU.requestAdapter', getStackTraceAsString(this.requestAdapter), args);
  return originalRequestAdapter.call(this, options);	
};

const originalRequestDevice = GPUAdapter.prototype.requestDevice;
GPUAdapter.prototype.requestDevice = function (descriptor?: Object) {
  const args = [];
  if (descriptor !== undefined) {
    args.push(descriptor);
  }
  addHistory('GPUAdapter.requestDevice', getStackTraceAsString(this.requestDevice), args);
  const device = originalRequestDevice.call(this, descriptor);
  deviceSet.add(device);
  return device;
};

const originalSubmit = GPUQueue.prototype.submit;
GPUQueue.prototype.submit = function (commandBuffers: GPUCommandBuffer[]) {
  const args = [];
  args.push(commandBuffers);
  addHistory('GPUQueue.submit', getStackTraceAsString(this.submit), args);
  return originalSubmit.call(this, commandBuffers);
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
  addHistory('GPUQueue.writeBuffer', getStackTraceAsString(this.writeBuffer), args);
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
  addHistory('GPUQueue.writeTexture', getStackTraceAsString(this.writeTexture), args);
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
  addHistory('GPUQueue.copyExternalImageToTexture', getStackTraceAsString(this.copyExternalImageToTexture), args);

  const imageData = cloneImageSourceAsImageData(source.source);

  const texture = destination.texture;
  if (textureSet.has(texture)) {
    textureProperties.get(texture)!.imageData = imageData;
    console.log(textureProperties);
    dispatchCustomEvent('webgpu-devtools-texture-image', {
      imageData: imageData
    });
  } else {
    console.warn('Unknown texture', texture);
  }

  return originalCopyExternalImageToTexture.call(this, source, destination, copySize);
};

const originalCreateShaderModule = GPUDevice.prototype.createShaderModule;
GPUDevice.prototype.createShaderModule = function (descriptor: Object) {
  const args = [];
  args.push(descriptor);
  addHistory('GPUDevice.createShaderModule', getStackTraceAsString(this.createShaderModule), args);
  return originalCreateShaderModule.call(this, descriptor);
};

const originalCreateBuffer = GPUDevice.prototype.createBuffer;
GPUDevice.prototype.createBuffer = function (descriptor: Object) {
  const args = [];
  args.push(descriptor);
  addHistory('GPUDevice.createBuffer', getStackTraceAsString(this.createBuffer), args);
  const buffer = originalCreateBuffer.call(this, descriptor);
  bufferSet.add(buffer);
  console.log(bufferSet);
  return buffer;
};

const originalCreateTexture = GPUDevice.prototype.createTexture;
GPUDevice.prototype.createTexture = function (descriptor: Object) {
  const args = [];
  args.push(descriptor);
  addHistory('GPUDevice.createTexture', getStackTraceAsString(this.createTexture), args);
  const texture = originalCreateTexture.call(this, descriptor);
  textureSet.add(texture);
  textureProperties.set(texture, {
    imageData: null	  
  });
  console.log(textureSet);
  return texture;
};

const originalImportExternalTexture = GPUDevice.prototype.importExternalTexture;
GPUDevice.prototype.importExternalTexture = function (descriptor: Object) {
  const args = [];
  args.push(descriptor);
  addHistory('GPUDevice.importExternalTexture', getStackTraceAsString(this.importExternalTexture), args);
  const texture = originalImportExternalTexture.call(this, descriptor);
  console.log(texture);
  return texture;	
};

const originalDestroyBuffer = GPUBuffer.prototype.destroy;
GPUBuffer.prototype.destroy = function () {
  addHistory('GPUDevice.createBuffer', getStackTraceAsString(this.destroy));
  if (bufferSet.has(this)) {
    bufferSet.delete(this);
  } else {
    console.warn('Unknown GPUBuffer', this);
  }
  return originalDestroyBuffer.call(this);
};

const originalCreateView = GPUTexture.prototype.createView;
GPUTexture.prototype.createView = function (descriptor?: Object) {
  const args = [];
  if (descriptor !== undefined) {
    args.push(descriptor);
  }
  addHistory('GPUTexture.createView', getStackTraceAsString(this.createView), args);
  return originalCreateView.call(this, descriptor);
};

const originalDestroyTexture = GPUTexture.prototype.destroy;
GPUTexture.prototype.destroy = function () {
  addHistory('GPUTexture.destroy', getStackTraceAsString(this.destroy));
  if (textureSet.has(this)) {
    textureSet.delete(this);
    textureProperties.delete(this);
  } else {
    console.warn('Unknown GPUTexture', this);
  }
  return originalDestroyTexture.call(this);
};

const overrideFunction = (proto: any, functionName: string) : void => {
  const originalFunction = proto[functionName];
  proto[functionName] = function (this) {
    dumpFunctionCall(this, originalFunction, arguments);
    return originalFunction.apply(this, arguments);
  };
};

// TODO: Implement
const toWebGPUConstantString = (value: number) : string | null => {
  return null;
};

// TODO: Traverse more properly for array or object
// TODO: Support WebGPU objects, images, and others
// TODO: Rename
const getParamAsString = (value: any) : string => {
  if (Array.isArray(value)) {
    const strs = [];
    for (let i = 0; i < value.length; i++) {
      strs.push(getParamAsString(value[i]));
    }
    return `[${strs.join(', ')}]`;
  } else if (typeof value === 'object') {
    const strs = [];
    for (const key in value) {
      strs.push(`${key}: ${getParamAsString(value[key])}`);
    }
    return `{${strs.join(', ')}}`;
  } else if (typeof value === 'string') {
    return `"${value}"`;
  } else if (typeof value === 'number') {
    const constantString = toWebGPUConstantString(value);
    if (constantString !== null) {
      return constantString;
    }
  }

  return `${value}`;
};

let dumpCount = 0;
const dumpFunctionCall = (object: any, func: any, args: IArguments) : void => {
  // Dump the first 100 for now.
  if (dumpCount++ > 100) {
    return;
  }

  let str = `${object.constructor.name}.${func.name}\n`;
  for (let i = 0; i < args.length; i++) {
    str += `${i}: ${getParamAsString(args[i])}\n`;
  }
  console.log(str);
};

/*
if (navigator.gpu) {
  overrideFunction(HTMLCanvasElement.prototype, 'getContext');
  overrideFunction(GPUDevice.prototype, 'destroy');
  overrideFunction(GPUDevice.prototype, 'createBuffer');
  overrideFunction(GPUDevice.prototype, 'createTexture');
  overrideFunction(GPUDevice.prototype, 'createSampler');
  overrideFunction(GPUDevice.prototype, 'createBindGroupLayout');
  overrideFunction(GPUDevice.prototype, 'createPipelineLayout');
  overrideFunction(GPUDevice.prototype, 'createBindGroup');
  overrideFunction(GPUDevice.prototype, 'createShaderModule');
  overrideFunction(GPUDevice.prototype, 'createComputePipeline');
  overrideFunction(GPUDevice.prototype, 'createRenderPipeline');
  overrideFunction(GPUDevice.prototype, 'createComputePipelineAsync');
  overrideFunction(GPUDevice.prototype, 'createRenderPipelineAsync');
  overrideFunction(GPUDevice.prototype, 'createCommandEncoder');
  overrideFunction(GPUDevice.prototype, 'createRenderBundleEncodeer');
  overrideFunction(GPUDevice.prototype, 'createQuerySet');
  overrideFunction(GPUCommandEncoder.prototype, 'draw');
  overrideFunction(GPUCommandEncoder.prototype, 'drawIndexed');
  overrideFunction(GPUCommandEncoder.prototype, 'drawIndexedIndirect');
  overrideFunction(GPUCommandEncoder.prototype, 'drawIndirect');
  overrideFunction(GPUComputePassEncoder.prototype, 'draw');
  overrideFunction(GPUComputePassEncoder.prototype, 'drawIndexed');
  overrideFunction(GPUComputePassEncoder.prototype, 'drawIndexedIndirect');
  overrideFunction(GPUComputePassEncoder.prototype, 'drawIndirect');
  overrideFunction(GPURenderPassEncoder.prototype, 'draw');
  overrideFunction(GPURenderPassEncoder.prototype, 'drawIndexed');
  overrideFunction(GPURenderPassEncoder.prototype, 'drawIndexedIndirect');
  overrideFunction(GPURenderPassEncoder.prototype, 'drawIndirect');
  overrideFunction(GPURenderBundleEncoder.prototype, 'draw');
  overrideFunction(GPURenderBundleEncoder.prototype, 'drawIndexed');
  overrideFunction(GPURenderBundleEncoder.prototype, 'drawIndexedIndirect');
  overrideFunction(GPURenderBundleEncoder.prototype, 'drawIndirect');
}
*/
