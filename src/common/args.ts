export const argNamesTable: Record<string, string[]> = {
  'GPU.requestAdapter': [
    'options'
  ],
  'GPUAdapter.requestDevice': [
    'descriptor'
  ],
  'GPUBuffer.mapAsync': [
    'mode',
    'offset',
    'size'
  ],
  'GPUBuffer.getMappedRange': [
    'offset',
    'size'
  ],
  'GPUCanvasContext.configure': [
    'configuration'
  ],
  'GPUCommandEncoder.beginRenderPass': [
    'descriptor'
  ],
  'GPUCommandEncoder.finish': [
    'descriptor'
  ],
  'GPUDevice.createShaderModule': [
    'descriptor'
  ],
  'GPUDevice.createBuffer': [
    'descriptor'
  ],
  'GPUDevice.createRenderPipeline': [
    'descriptor'
  ],
  'GPUDevice.createRenderPipelineAsync': [
    'descriptor'
  ],
  'GPUDevice.createCommandEncoder': [
    'descriptor'
  ],
  'GPUDevice.createTexture': [
    'descriptor'
  ],
  'GPUDevice.importExternalTexture': [
    'descriptor'
  ],
  'GPUQueue.submit': [
    'commandBuffers'
  ],
  'GPUQueue.writeBuffer': [
    'buffer',
    'bufferOffset',
    'data',
    'dataOffset',
    'size'
  ],
  'GPUQueue.writeTexture': [
    'destination',
    'data',
    'dataLayout',
    'size'
  ],
  'GPUQueue.copyExternalImageToTexture': [
    'source',
    'destination',
    'copySize'
  ],
  'GPURenderPassEncoder.setPipeline': [
    'pipeline'
  ],
  'GPURenderPassEncoder.setIndexBuffer': [
    'buffer',
    'indexFormat',
    'offset',
    'size'
  ],
  'GPURenderPassEncoder.setVertexBuffer': [
    'slot',
    'buffer',
    'offset',
    'size'
  ],
  'GPURenderPassEncoder.draw': [
    'vertexCount',
    'instanceCount',
    'firstVertex',
    'firstInstance'
  ],
  'GPURenderPassEncoder.drawIndexed': [
    'indexCount',
    'instanceCount',
    'firstIndex',
    'baseVertex',
    'firstInstance'
  ],
  'GPURenderPassEncoder.setViewport': [
    'x',
    'y',
    'width',
    'height',
    'minDepth',
    'maxDepth'
  ],
  'GPURenderPipeline.getBindGroupLayout': [
    'index'
  ],
  'GPUTexture.createView': [
    'descriptor'
  ],
  'HTMLCanvasElement.getContext': [	
    'contextType',
    'contextAttributes'
  ],
  'OffscreenCanvas.getContext': [	
    'contextIType',
    'contextAttributes'
  ]
};
