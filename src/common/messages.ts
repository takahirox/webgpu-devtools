import { ResourceId } from "./constants";

const prefix = 'webgpu_devtools_';

export const Actions = {
  Buffer: prefix + 'buffer',
  Frame: prefix + 'frame',
  FunctionCall: prefix + 'function_call',
  Gpu: prefix + 'gpu',
  GpuAdapter: prefix + 'gpu_adapter',
  GpuBindGroup: prefix + 'gpu_bind_group',
  GpuBindGroupLayout: prefix + 'gpu_bind_group_layout',
  GpuCanvasContext: prefix + 'gpu_canvas_context',
  GpuComputePassEncoder: prefix + 'gpu_compute_pass_encoder',
  GpuComputePipeline: prefix + 'gpu_compute_pipeline',
  GpuCommandEncoder: prefix + 'gpu_command_encoder',
  GpuDevice: prefix + 'gpu_device',
  GpuPipelineLayout: prefix + 'gpu_pipeline_layout',
  GpuQueue: prefix + 'gpu_queue',
  GpuRenderBundle: prefix + 'gpu_render_bundle',
  GpuRenderBundleEncoder: prefix + 'gpu_render_bundle_encoder',
  GpuRenderPassEncoder: prefix + 'gpu_render_pass_encoder',
  GpuRenderPipeline: prefix + 'gpu_render_pipeline',
  GpuSampler: prefix + 'gpu_sampler',
  Loaded: prefix + 'loaded',
  ShaderModule: prefix + 'shader_module',
  Texture: prefix + 'texture',
  TextureView: prefix + 'texture_view'
};

export const PortNames = {
  ContentScript: prefix + 'content_script',
  Panel: prefix + 'panel'
};

type BaseSerialized = {
  id: ResourceId;
  label: string;
  creationFrameNum: number;
  creationStackTrace: string[];
  errorMessage?: string;
  deletionFrameNum?: number;
  deletionStackTrace?: string[];
  destroyed?: boolean;
};

export type SerializedGPU = BaseSerialized & {
  preferredCanvasFormat: GPUTextureFormat;
  wgslLanguageFeatures: string[];
};

export type SerializedGPUAdapter = BaseSerialized & {
  features: string[];
  limits: Record<string, number>;
  isFallbackAdapter: boolean;
  info?: Record<string, string>;
};

export type SerializedGPUDevice = BaseSerialized & {
  descriptor?: GPUDeviceDescriptor;
  features: string[];
  limits: Record<string, number>;
  queue: ResourceId;
};

export type SerializedGPUBindGroup = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
};

export type SerializedGPUBindGroupLayout = BaseSerialized & {
  // TODO: Avoid object
  descriptor?: object;
  pipeline?: object;
  index?: number;
};

export type SerializedGPUCanvasContext = BaseSerialized & {
  // TODO: Avoid object
  configuration: object | null;
};

export type SerializedGPUCommandEncoder = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
  state: string;
};

export type SerializedGPUComputePassEncoder = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
  parentEncoder: object;
  state: string;
  pipeline: object | null;
};

export type SerializedGPUComputePipeline = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
};

export type SerializedBuffer = BaseSerialized & {
  alive: boolean;
  descriptor?: GPUBufferDescriptor;
  size: number;
  usage: number;
  mapState: string;
  content?: ArrayBuffer | string;
};

export type SerializedGPUPipelineLayout = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
};

export type SerializedGPUQueue = BaseSerialized & {
  descriptor?: GPUQueueDescriptor;
};

// TODO: Implement property
export type SerializedGPURenderBundle = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
};

export type SerializedGPURenderBundleEncoder = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
  state: string;
};

export type SerializedGPURenderPassEncoder = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
  parentEncoder: object;
  state: string;
  pipeline: object | null;
  viewport: {
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number
  } | null;
};

export type SerializedGPURenderPipeline = BaseSerialized & {
  // TODO: Avoid object
  descriptor: object;
  topology: string;
};

export type SerializedGPUSampler = BaseSerialized & {
  descriptor?: GPUSamplerDescriptor;
};

export type SerializedShaderModule = BaseSerialized & {
  descriptor: GPUShaderModuleDescriptor;
  compilationInfo: GPUCompilationInfo;
};

export type SerializedTexture = BaseSerialized & {
  id: ResourceId;
  label: string;
  descriptor: object; // TODO: Fix me
  width: number;
  height: number;
  depthOrArrayLayers: number;
  mipLevelCount: number;
  sampleCount: number;
  dimension: string;
  format: string;
  usage: number;
  content?: ImageData | string;
};

export type SerializedTextureView = BaseSerialized & {
  descriptor: GPUTextureViewDescriptor;
  parentTexture: ResourceId;
};

// ImageData is too huge to send message so convert it as URL
// TODO: Think of more efficient way to pass the texture content to panel
export const toURLFromImageData = (data: ImageData): Promise<string> => {
  return new Promise((resolve: (url: string) => void) => {
    const canvas = document.createElement('canvas');
    canvas.width = data.width;
    canvas.height = data.height;
    const context = canvas.getContext('2d');
    context.putImageData(data, 0, 0);
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    });
  });
};

export const toURLFromArrayBuffer = (data: ArrayBuffer): string => {
  const blob = new Blob([data], {type: 'application/octet-stream'});
  return URL.createObjectURL(blob);
};

export type SerializedGPUCanvasConfiguration =
  Omit<GPUCanvasConfiguration, 'device'> & {
    device: ResourceId
  };

export type SerializedGPURenderPassDescriptor =
  Omit<GPURenderPassDescriptor, 'colorAttachments' | 'depthStencilAttachment'> & {
    colorAttachments: Iterable<SerializedGPURenderPassColorAttachment | null>;
    depthStencilAttachment: SerializedGPURenderPassDepthStencilAttachment;
  };

export type SerializedGPURenderPassColorAttachment =
  Omit<GPURenderPassColorAttachment, 'view' | 'resolveTarget'> & {
    view: ResourceId;
    resolveTarget: ResourceId;
  };

export type SerializedGPURenderPassDepthStencilAttachment =
  Omit<GPURenderPassDepthStencilAttachment, 'view'> & {
    view: ResourceId;
  };

export type SerializedGPUExternalTextureDescriptor =
  Omit<GPUExternalTextureDescriptor, 'source'> & {
    source: SerializedHTMLVideoElement
  };

export type SerializedHTMLVideoElement = {
  // TODO: Enhance
  width: number;
  height: number;
};

export type SerializedGPUImageCopyExternalImage =
  Omit<GPUImageCopyExternalImage, 'source'> & {
    source: SerializedHTMLElementSource
  };

export type SerializedHTMLElementSource = {
  // TODO: Enhance
  width: number;
  height: number;
};

export type TypedArrayName =
  'Float64Array' |
  'Float32Array' |
  'Uint32Array' |
  'Uint16Array' |
  'Uint8Array';

export type SerializedBufferSource = {
  type: 'ArrayBuffer' | TypedArrayName;
  content: ArrayBuffer;
};

export type SerializedGPUImageCopyTexture =
  Omit<GPUImageCopyTexture, 'texture'> & {
    texture: ResourceId
  };

export type SerializedGPUImageCopyTextureTagged =
  Omit<GPUImageCopyTextureTagged, 'texture'> & {
    texture: ResourceId
  };

export type SerializedGPURenderPipelineDescriptor =
  Omit<GPURenderPipelineDescriptor, 'vertex' | 'fragment'> & {
    vertex: SerializedGPUVertexState,
    fragment?: SerializedGPUFragmentState
  };

export type SerializedGPUVertexState =
  Omit<GPUVertexState, 'module'> & {
    module: ResourceId
  };

export type SerializedGPUFragmentState =
  Omit<GPUFragmentState, 'module'> & {
    module: ResourceId
  };
