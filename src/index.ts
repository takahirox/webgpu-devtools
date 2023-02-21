import { HookManager } from "./hooks/hook_manager";
import { gpuManager } from "./resource_managers/gpu";

HookManager.override();

if ('gpu' in navigator) {
  gpuManager.add(navigator.gpu);
}
