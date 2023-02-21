import { animationFrameCounter } from "./animation_frame_counter";

type History = {
  frameNum: number;
  workgroupCountX: number;
  workgroupCountY: number;
  workgroupCountZ: number;
};

class ComputeManager {
  private histories: History[];

  constructor() {
    this.histories = [];
  }

  dispatchWorkgroups(
    workgroupCountX: number,
    workgroupCountY: number,
    workgroupCountZ: number
  ): void {
    this.histories.push({
      frameNum: animationFrameCounter.get(),
      workgroupCountX,
      workgroupCountY,
      workgroupCountZ
    });
  }

  // TODO: Implement
  /*
  dispatchWorkgroupsIndirect(
  ): void {
  }
  */

  getHistories(): History[] {
    return this.histories;
  }
}

export const computeManager = new ComputeManager();
