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
