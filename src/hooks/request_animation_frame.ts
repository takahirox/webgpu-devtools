import { animationFrameCounter } from "../analyzers/animation_frame_counter";

export const {
  requestAnimationFrame: Self_requestAnimationFrame
} = self;

function hookedRequestAnimationFrame(
  this: Window,
  callback: FrameRequestCallback
): number {
  animationFrameCounter.count();
  return Self_requestAnimationFrame.call(this, callback);
};

export class RequestAnimationFrameHook {
  static override(): void {
    self.requestAnimationFrame = hookedRequestAnimationFrame;
  }

  static restore(): void {
    self.requestAnimationFrame = Self_requestAnimationFrame;
  }
}
