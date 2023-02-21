import { callFunction } from "./base";
import { gpuCommandEncoderManager } from "../resource_managers/gpu_command_encoder";
import { gpuRenderPassEncoderManager } from "../resource_managers/gpu_render_pass_encoder";
import { gpuRenderPipelineManager } from "../resource_managers/gpu_render_pipeline";
import { drawcallManager } from "../analyzers/drawcall_manager";
import { getStackTraceAsString } from "../utils/stacktrace";
import { EncoderState } from "../common/constants";

// TODO: Set hooks to all the functions

export const {
  setPipeline: GPURenderPassEncoder_setPipeline,
  setIndexBuffer: GPURenderPassEncoder_setIndexBuffer,
  setVertexBuffer: GPURenderPassEncoder_setVertexBuffer,
  draw: GPURenderPassEncoder_draw,
  drawIndexed: GPURenderPassEncoder_drawIndexed,
  setViewport: GPURenderPassEncoder_setViewport,
  end: GPURenderPassEncoder_end
} = GPURenderPassEncoder.prototype;

function setPipeline(
  this: GPURenderPassEncoder,
  pipeline: GPURenderPipeline
): undefined {
  const stackTrace = getStackTraceAsString(setPipeline);

  return callFunction<undefined>(
    this,
    GPURenderPassEncoder_setPipeline,
    'GPURenderPassEncoder.setPipeline',
    arguments,
    stackTrace,
    () => {
      gpuRenderPassEncoderManager.setPipeline(
        gpuRenderPassEncoderManager.getId(this),
        pipeline
      );
	}
  );
}

function setIndexBuffer(
  this: GPURenderPassEncoder
): undefined {
  const stackTrace = getStackTraceAsString(setIndexBuffer);

  return callFunction<undefined>(
    this,
    GPURenderPassEncoder_setIndexBuffer,
    'GPURenderPassEncoder.setIndexBuffer',
    arguments,
    stackTrace
  );
}

function setVertexBuffer(
  this: GPURenderPassEncoder
): undefined {
  const stackTrace = getStackTraceAsString(setVertexBuffer);

  return callFunction<undefined>(
    this,
    GPURenderPassEncoder_setVertexBuffer,
    'GPURenderPassEncoder.setVertexBuffer',
    arguments,
    stackTrace
  );
}

function draw(
  this: GPURenderPassEncoder,
  vertexCount: number,
  instanceCount?: number,
  _firstVertex?: number,
  _firstInstance?: number
): undefined {
  const stackTrace = getStackTraceAsString(draw);

  return callFunction<undefined>(
    this,
    GPURenderPassEncoder_draw,
    'GPURenderPassEncoder.draw',
    arguments,
    stackTrace,
    () => {
      const { pipeline } = gpuRenderPassEncoderManager.getProperties(
        gpuRenderPassEncoderManager.getId(this)
      );
      const { topology } = gpuRenderPipelineManager.getProperties(
	   gpuRenderPipelineManager.getId(pipeline)
      );
      drawcallManager.draw(vertexCount, instanceCount, topology);
    }
  );
};

function drawIndexed(
  this: GPURenderPassEncoder,
  indexCount: number,
  instanceCount?: number,
  _firstIndex?: number,
  _baseVertex?: number,
  _firstInstance?: number
): undefined {
  const stackTrace = getStackTraceAsString(drawIndexed);

  return callFunction<undefined>(
    this,
    GPURenderPassEncoder_drawIndexed,
    'GPURenderPassEncoder.drawIndexed',
    arguments,
    stackTrace,
    () => {
      const { pipeline } = gpuRenderPassEncoderManager.getProperties(
        gpuRenderPassEncoderManager.getId(this)
      );
      const { topology } = gpuRenderPipelineManager.getProperties(
        gpuRenderPipelineManager.getId(pipeline)
      );
      drawcallManager.drawIndexed(indexCount, instanceCount, topology);
    }
  );
}

function setViewport(
  this: GPURenderPassEncoder,
  x: number,
  y: number,
  width: number,
  height: number,
  minDepth: number,
  maxDepth: number
): undefined {
  const stackTrace = getStackTraceAsString(setViewport);

  return callFunction<undefined>(
    this,
    GPURenderPassEncoder_setViewport,
    'GPURenderPassEncoder.setViewport',
    arguments,
    stackTrace,
    () => {
      gpuRenderPassEncoderManager.setViewport(
        gpuRenderPassEncoderManager.getId(this),
        x,
        y,
        width,
        height,
        minDepth,
        maxDepth
      );
    }
  );
}

function end(
  this: GPURenderPassEncoder
): undefined {
  const stackTrace = getStackTraceAsString(end);

  return callFunction<undefined>(
    this,
    GPURenderPassEncoder_end,
    'GPURenderPassEncoder.end',
    arguments,
    stackTrace,
    () => {
      gpuRenderPassEncoderManager.setState(
        gpuRenderPassEncoderManager.getId(this),
        EncoderState.ended
      );
      const { parentEncoder } = gpuRenderPassEncoderManager.getProperties(gpuRenderPassEncoderManager.getId(this));
      gpuCommandEncoderManager.setState(
        gpuCommandEncoderManager.getId(parentEncoder),
        EncoderState.open
      );
    }
  );

};

export class GPURenderPassEncoderHook {
  static override(): void {
    GPURenderPassEncoder.prototype.setPipeline = setPipeline;
    GPURenderPassEncoder.prototype.setIndexBuffer = setIndexBuffer;
    GPURenderPassEncoder.prototype.setVertexBuffer = setVertexBuffer;
    GPURenderPassEncoder.prototype.draw = draw;
    GPURenderPassEncoder.prototype.drawIndexed = drawIndexed;
    GPURenderPassEncoder.prototype.setViewport = setViewport;
    GPURenderPassEncoder.prototype.end = end;
  }

  static restore(): void {
    GPURenderPassEncoder.prototype.setPipeline = GPURenderPassEncoder_setPipeline;
    GPURenderPassEncoder.prototype.setIndexBuffer = GPURenderPassEncoder_setIndexBuffer;
    GPURenderPassEncoder.prototype.setVertexBuffer = GPURenderPassEncoder_setVertexBuffer;
    GPURenderPassEncoder.prototype.draw = GPURenderPassEncoder_draw;
    GPURenderPassEncoder.prototype.drawIndexed = GPURenderPassEncoder_drawIndexed;
    GPURenderPassEncoder.prototype.setViewport = GPURenderPassEncoder_setViewport;
    GPURenderPassEncoder.prototype.end = GPURenderPassEncoder_end;
  }
}
