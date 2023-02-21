import { type ResourceId } from "../common/constants";
import { type SerializedShaderModule } from "../common/messages";
import {
  type BaseProperties,
  BaseResourceManager
} from "./base";
import { deepCopy } from "../utils/copy";

type GPUShaderModuleProperties = BaseProperties & {
  descriptor: GPUShaderModuleDescriptor;
  compilationInfo?: GPUCompilationInfo;
};

class GPUShaderModuleResourceManager
  extends BaseResourceManager<GPUShaderModule, GPUShaderModuleProperties> {
  add(
    obj: GPUShaderModule,
    stackTrace: string[],
    descriptor: GPUShaderModuleDescriptor
  ): ResourceId {
    return this.register(obj, {
      creationStackTrace: stackTrace,
      // TODO: Remove cast if possible
      descriptor: deepCopy(descriptor) as GPUShaderModuleDescriptor
    });
  }

  setCompilationInfo(id: ResourceId, compilationInfo: GPUCompilationInfo): void {
    this.getProperties(id).compilationInfo = compilationInfo;
  }

  serialize(id: ResourceId): SerializedShaderModule {
    const { label } = this.getObject(id);
    const {
      compilationInfo,
      creationFrameNum,
      creationStackTrace,
      descriptor
    } = this.getProperties(id);
    return {
      id,
      label,
      descriptor,
      compilationInfo: deepCopy(compilationInfo) as GPUCompilationInfo,
      creationFrameNum,
      creationStackTrace
    };
  }
}

export const gpuShaderModuleManager = new GPUShaderModuleResourceManager();
