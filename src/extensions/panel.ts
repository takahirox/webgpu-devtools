import { Actions, PortNames } from "../common/messages";
import { addFrame, resetFrames } from "./panel/frame";
import { addGPU, resetGPUs } from "./panel/gpu";
import { addGPUAdapter, resetGPUAdapters } from "./panel/gpu_adapter";
import { addGPUBuffer, resetGPUBuffers } from "./panel/gpu_buffer";
import { addGPUBindGroup, resetGPUBindGroups } from "./panel/gpu_bind_group";
import { addGPUBindGroupLayout, resetGPUBindGroupLayouts } from "./panel/gpu_bind_group_layout";
import { addGPUCanvasContext, resetGPUCanvasContexts } from "./panel/gpu_canvas_context";
import { addGPUCommandEncoder, resetGPUCommandEncoders } from "./panel/gpu_command_encoder";
import { addGPUComputePassEncoder, resetGPUComputePassEncoders } from "./panel/gpu_compute_pass_encoder";
import { addGPUComputePipeline, resetGPUComputePipelines } from "./panel/gpu_compute_pipeline";
import { addGPUDevice, resetGPUDevices } from "./panel/gpu_device";
import { addGPUPipelineLayout, resetGPUPipelineLayouts } from "./panel/gpu_pipeline_layout";
import { addGPUQueue, resetGPUQueues } from "./panel/gpu_queue";
import { addGPURenderBundleEncoder, resetGPURenderBundleEncoders } from "./panel/gpu_render_bundle_encoder";
import { addGPURenderPassEncoder, resetGPURenderPassEncoders } from "./panel/gpu_render_pass_encoder";
import { addGPURenderPipeline, resetGPURenderPipelines } from "./panel/gpu_render_pipeline";
import { addGPUSampler, resetGPUSamplers } from "./panel/gpu_sampler";
import { addGPUShaderModule, resetGPUShaderModules } from "./panel/gpu_shader_module";
import { addGPUTexture, resetGPUTextures } from "./panel/gpu_texture";
import { addGPUTextureView, resetGPUTextureViews } from "./panel/gpu_texture_view";
import { hideAll, showAll } from "./panel/hidable";

const port = chrome.runtime.connect(null, {name: PortNames.Panel});
const tabId = chrome.devtools.inspectedWindow.tabId;

const resetButton = document.getElementById('resetButton');
const expandAllButton = document.getElementById('expandAllButton');
const hideAllButton = document.getElementById('hideAllButton');

const reset = (): void => {
  resetGPUs();
  resetGPUAdapters();
  resetGPUBuffers();
  resetGPUBindGroups();
  resetGPUBindGroupLayouts();
  resetGPUCanvasContexts();
  resetGPUCommandEncoders();
  resetGPUComputePassEncoders();
  resetGPUComputePipelines();
  resetGPUDevices();
  resetGPUPipelineLayouts();
  resetGPUQueues();
  resetGPURenderBundleEncoders();
  resetGPURenderPassEncoders();
  resetGPURenderPipelines();
  resetGPUShaderModules();
  resetGPUTextures();
  resetGPUSamplers();
  resetGPUTextureViews();
  resetFrames();
};

resetButton.addEventListener('click', reset);
expandAllButton.addEventListener('click', showAll);
hideAllButton.addEventListener('click', hideAll);

// TODO: Avoid any
port.onMessage.addListener((message: any): void => {
  switch (message.action) {
    case Actions.Buffer:
      addGPUBuffer(message.buffer);
      break;
    case Actions.Gpu:
      addGPU(message.gpu);
      break;
    case Actions.GpuAdapter:
      addGPUAdapter(message.adapter);
      break;
    case Actions.GpuBindGroup:
      addGPUBindGroup(message.bindGroup);
      break;
    case Actions.GpuBindGroupLayout:
      addGPUBindGroupLayout(message.bindGroupLayout);
      break;
    case Actions.GpuCanvasContext:
      addGPUCanvasContext(message.canvasContext);
      break;
    case Actions.GpuCommandEncoder:
      addGPUCommandEncoder(message.commandEncoder);
      break;
    case Actions.GpuComputePassEncoder:
      addGPUComputePassEncoder(message.computePassEncoder);
      break;
    case Actions.GpuComputePipeline:
      addGPUComputePipeline(message.computePipeline);
      break;
    case Actions.GpuDevice:
      addGPUDevice(message.device);
      break;
    case Actions.GpuPipelineLayout:
      addGPUPipelineLayout(message.pipelineLayout);
      break;
    case Actions.GpuQueue:
      addGPUQueue(message.queue);
      break;
    case Actions.GpuRenderBundleEncoder:
      addGPURenderBundleEncoder(message.renderBundleEncoder);
      break;
    case Actions.GpuRenderPassEncoder:
      addGPURenderPassEncoder(message.renderPassEncoder);
      break;
    case Actions.GpuRenderPipeline:
      addGPURenderPipeline(message.renderPipeline);
      break;
    case Actions.ShaderModule:
      addGPUShaderModule(message.shaderModule);
      break;
    case Actions.Texture:
      addGPUTexture(message.texture);
      break;
    case Actions.GpuSampler:
      addGPUSampler(message.sampler);
      break;
    case Actions.TextureView:
      addGPUTextureView(message.textureView);
      break;
    case Actions.Frame:
      addFrame(message.frame);
      break;
    case Actions.Loaded:
      reset();
      break;
  }
});

port.postMessage({
  action: Actions.Loaded,
  tabId
});
