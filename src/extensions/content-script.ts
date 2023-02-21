import {
  Actions,
  PortNames,
  toURLFromArrayBuffer,
  toURLFromImageData
} from "../common/messages";

if ('gpu' in navigator) {
  const port = chrome.runtime.connect({name: PortNames.ContentScript});

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('webgpu-devtools.bundle.js');
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);

  window.addEventListener(
    Actions.FunctionCall,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.FunctionCall,
        name: event.detail.name
      });
    },
    false
  );

  window.addEventListener(
    Actions.Buffer,
    (event: CustomEvent): void => {
      const buffer = event.detail.buffer;
      if (buffer.content !== undefined) {
        buffer.content = toURLFromArrayBuffer(buffer.content);
      }
      port.postMessage({
        action: Actions.Buffer,
        buffer
      });
    },
    false
  );

  window.addEventListener(
    Actions.Gpu,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.Gpu,
        gpu: event.detail.gpu
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuAdapter,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuAdapter,
        adapter: event.detail.adapter
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuBindGroup,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuBindGroup,
        bindGroup: event.detail.bindGroup
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuBindGroupLayout,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuBindGroupLayout,
        bindGroupLayout: event.detail.bindGroupLayout
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuCanvasContext,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuCanvasContext,
        canvasContext: event.detail.canvasContext
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuComputePipeline,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuComputePipeline,
        computePipeline: event.detail.computePipeline
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuCommandEncoder,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuCommandEncoder,
        commandEncoder: event.detail.commandEncoder
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuComputePassEncoder,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuComputePassEncoder,
        computePassEncoder: event.detail.computePassEncoder
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuDevice,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuDevice,
        device: event.detail.device
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuPipelineLayout,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuPipelineLayout,
        pipelineLayout: event.detail.pipelineLayout
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuQueue,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuQueue,
        queue: event.detail.queue
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuRenderPassEncoder,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuRenderPassEncoder,
        renderPassEncoder: event.detail.renderPassEncoder
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuRenderPipeline,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuRenderPipeline,
        renderPipeline: event.detail.renderPipeline
      });
    },
    false
  );

  window.addEventListener(
    Actions.GpuSampler,
    (event: CustomEvent): void => {
      port.postMessage({
        action: Actions.GpuSampler,
        sampler: event.detail.sampler
      });
    },
    false
  );

  window.addEventListener(
    Actions.ShaderModule,
    (event: CustomEvent): void => {
      const shaderModule = event.detail.shaderModule;
      port.postMessage({
        action: Actions.ShaderModule,
        shaderModule
      });
    },
    false
  );

  // TODO: Avoid any
  const textureQueue: any[] = [];

  const postTextures = async () => {
    while (textureQueue.length > 0) {
      const texture = textureQueue[0];

      if (texture.content !== undefined) {
        texture.content = await toURLFromImageData(texture.content);
      }

      port.postMessage({
        action: Actions.Texture,
        texture
      });

      textureQueue.shift();
    }
  };

  window.addEventListener(
    Actions.Texture,
    (event: CustomEvent): void => {
      textureQueue.push(event.detail.texture);
      if (textureQueue.length === 1) {
        postTextures();
      }
    },
    false
  );

  window.addEventListener(
    Actions.TextureView,
    (event: CustomEvent): void => {
      const textureView = event.detail.textureView;
      port.postMessage({
        action: Actions.TextureView,
        textureView
      });
    },
    false
  );

  // TODO: Rewrite more elegantly
  // TODO: Avoid any
  const traverseAndConvertArrayBufferToURL = (data: any): any => {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        data[i] = traverseAndConvertArrayBufferToURL(data[i]);
      }
    } else if (typeof data === 'object') {
      if (data.isArrayBuffer === true || data.isTypedArray === true) {
        data.content = toURLFromArrayBuffer(data.content);
      } else {
        for (const key in data) {
          data[key] = traverseAndConvertArrayBufferToURL(data[key]);
        }
      }
    }
    return data;
  };

  // TODO: Avoid any
  const frameQueue: any[] = [];

  const postFrames = async () => {
    while (frameQueue.length > 0) {
      const frame = frameQueue[0];
      const pending = [];
      if (frame.framebuffer !== undefined &&
        frame.framebuffer.content !== undefined) {
        pending.push(
          toURLFromImageData(frame.framebuffer.content)
            .then((url: string): void => {
              frame.framebuffer.content = url;
            })
        );
      }

      for (const command of frame.commands) {
        for (let i = 0; i < command.args.length; i++) {
          command.args[i] = traverseAndConvertArrayBufferToURL(command.args[i]);
        }
        command.result = traverseAndConvertArrayBufferToURL(command.result);
      }

      await Promise.all(pending);

      port.postMessage({
        action: Actions.Frame,
        frame
      });

      frameQueue.shift();
    }
  };

  window.addEventListener(
    Actions.Frame,
    (event: CustomEvent): void => {
      frameQueue.push(event.detail.frame);
      if (frameQueue.length === 1) {
        postFrames();
      }
    },
    false
  );

  port.postMessage({
    action: Actions.Loaded
  });
}
