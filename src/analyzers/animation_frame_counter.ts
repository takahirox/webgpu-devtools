import { HookManager } from "../hooks/hook_manager";
import { resultReporter } from "./result_reporter";

// Report the rrecords at animation frame #50
// or in five seconds.
// TODO: Make it configurable.

let reported = false;

const report = () => {
  if (reported) {
    return;
  }
  reported = true;
  HookManager.restore();
  resultReporter.report();
};

setTimeout(report, 5000);

class AnimationFrameCounter {
  private counter: number;

  constructor() {
    this.counter = 0;
  }

  count(): number {
    this.counter++;

    if (this.counter >= 50) {
      report();
    }

    return this.counter;
  }

  get(): number {
    return this.counter;
  }
}

export const animationFrameCounter = new AnimationFrameCounter();
