import { animationFrameCounter } from "../analyzers/animation_frame_counter";
import { type ResourceId } from "../common/constants";

class ResourceIdManager<T extends object> {
  private obj2id: WeakMap<T, ResourceId>;
  private id2obj: Map<ResourceId, T>;
  private count: number;

  constructor() {
    this.count = 0;
    this.obj2id = new WeakMap();
    this.id2obj = new Map();
  }

  allocate(obj: T): number {
    if (this.obj2id.has(obj)) {
      // Throw an error instead?
      return this.obj2id.get(obj);
    }

    const id = this.count;
    this.count++;
    this.obj2id.set(obj, id);
    this.id2obj.set(id, obj);
    return id;
  }

  deallocate(obj: T): void {
    if (!this.obj2id.has(obj)) {
      // Throw an error instead?
      return;
    }

    const id = this.obj2id.get(obj);
    this.obj2id.delete(obj);
    this.id2obj.delete(id);
  }

  getId(obj: T): number {
    if (!this.obj2id.has(obj)) {
      throw new Error(`Unknown object ${obj}`);
	}
    return this.obj2id.get(obj);
  }

  getObject(id: ResourceId): T {
    if (!this.id2obj.has(id)) {
      throw new Error(`Unknown id ${id}`);
	}
    return this.id2obj.get(id);
  }

  ids(): IterableIterator<ResourceId> {
    return this.id2obj.keys();
  }
}

// TODO: Don't unnecessarily hold WebGPU resources as much as possible not to block GC.
//       Using WeakMap/WeakSet and ResourceID where possible may be a good idea.
// TODO: Proper WebGPU error handling

export type BaseProperties = {
  creationFrameNum?: number;
  creationStackTrace: string[];
  errorMessage?: string;
  deletionFrameNum?: number;
  deletionStackTrace?: string[];
  destroyed?: boolean;
};

export abstract class BaseResourceManager<T extends object, U extends BaseProperties> {
  private idManager: ResourceIdManager<T>;
  private properties: Map<number, U>;

  constructor() {
    this.idManager = new ResourceIdManager();
    this.properties = new Map();
  }

  protected register(obj: T, properties: U): ResourceId {
    properties.creationFrameNum = animationFrameCounter.get();
    properties.destroyed = false;

    const id = this.idManager.allocate(obj);
    // TODO: Do deep copy the properties?
    this.properties.set(id, properties);
    return id;
  }

  delete(id: ResourceId): void {
    const obj = this.idManager.getObject(id);
    this.idManager.deallocate(obj);
    this.properties.delete(id);
  }

  destroy(id: ResourceId, stackTrace?: string[]): void {
    const properties = this.properties.get(id);
    properties.destroyed = true;
    properties.deletionFrameNum = animationFrameCounter.get();
    properties.deletionStackTrace = stackTrace;
  }

  getObject(id: ResourceId): T {
    return this.idManager.getObject(id);
  }

  getId(obj: T): ResourceId {
    return this.idManager.getId(obj);
  }

  getProperties(id: ResourceId): U {
    if (!this.properties.has(id)) {
      throw new Error(`Unknown ID ${id}`);
    }
    return this.properties.get(id);
  }

  ids(): IterableIterator<ResourceId> {
    return this.idManager.ids();
  }

  setErrorMessage(id: ResourceId, errorMessage: string): void {
    this.getProperties(id).errorMessage = errorMessage;
  }
}
