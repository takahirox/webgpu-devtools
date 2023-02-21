import { animationFrameCounter } from "./animation_frame_counter";

type History = {
  frameNum: number;
  count: number;
  // TODO: Rename
  evaluatedCount: number;
  instanceCount: number;
  topology: GPUPrimitiveTopology;
};

const getEvaluatedCount = (count: number, topology: GPUPrimitiveTopology): number => {
  switch (topology) {
    case 'point-list':
      return count;
    case 'line-list':
      return count / 2;
    case 'line-strip':
      return count - 1;
    case 'triangle-list':
      return count / 3;
    case 'triangle-strip':
      return count - 2;
  }
};

class DrawcallManager {
  private histories: History[];

  constructor() {
    this.histories = [];
  }

  draw(
    vertexCount: number,
    instanceCount: number,
    topology: GPUPrimitiveTopology
  ): void {
    this.histories.push({
      frameNum: animationFrameCounter.get(),
      count: vertexCount,
      evaluatedCount: getEvaluatedCount(vertexCount, topology),
      instanceCount,
      topology
    });
  }

  drawIndexed(
    indexCount: number,
    instanceCount: number,
    topology: GPUPrimitiveTopology
  ): void {
    this.histories.push({
      frameNum: animationFrameCounter.get(),
      count: indexCount,
      evaluatedCount: getEvaluatedCount(indexCount, topology),
      instanceCount,
      topology
    });
  }

  getHistories(): History[] {
    return this.histories;
  }
}

export const drawcallManager = new DrawcallManager();
