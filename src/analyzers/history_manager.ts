import { animationFrameCounter } from "./animation_frame_counter";
import { serialize } from "../utils/serialize";

// TODO: Avoid any

type History = {
  id: number;
  thisObject: any,
  args?: any[];
  frameNum: number;
  name: string;
  stackTrace: string[];
  done: boolean;
  result?: any;
  errorMessage?: string;
};

// TODO: Rename to CommandHistoryManager or CommandManager?
class HistoryManager {
  private histories: History[];
  private historyMap: Map<number, History>;
  private id: number;

  constructor() {
    this.histories = [];
    this.historyMap = new Map();
    this.id = 0;
  }

  add(thisObject: any, name: string, args: IArguments, stackTrace: string[]): number {
    const id = this.id++;

    const serializedArgs = [];
    for (let i = 0; i < args.length; i++) {
      serializedArgs.push(serialize(args[i]));
    }

    const frameNum = animationFrameCounter.get();
    const history: History = {
      id,
      thisObject: serialize(thisObject),
      args: serializedArgs,
      frameNum,
      name,
      stackTrace,
      done: false
    };

    this.histories.push(history);
    this.historyMap.set(id, history);
    return id;
  }

  setResult(id: number, result: any): void {
    if (!this.historyMap.has(id)) {
      throw new Error(`Unknown id ${id}`);
    }
    const history = this.historyMap.get(id)!;
    history.result = serialize(result);
    history.done = true;
  }

  setErrorMessage(id: number, errorMessage: string): void {
    if (!this.historyMap.has(id)) {
      throw new Error(`Unknown id ${id}`);
    }
    const history = this.historyMap.get(id)!;
    history.errorMessage = errorMessage;
    history.done = true;
  }

  getHistories(): History[] {
    return this.histories;
  }
}

export const historyManager = new HistoryManager();
