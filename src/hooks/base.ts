import { historyManager } from "../analyzers/history_manager";
import { gpuDeviceMap } from "../resource_managers/gpu_device";

// TODO: Avoid any. Casting loses the power of type check.

const setup = (thisObject: any) => {
  if (gpuDeviceMap.has(thisObject)) {
    const device = gpuDeviceMap.get(thisObject)!;
    device.pushErrorScope('validation');
    device.pushErrorScope('out-of-memory');
    device.pushErrorScope('internal');
  }
};

const tearDown = (
  thisObject: any,
  historyId: number,
  errorCallback?: (error: Error) => void
) => {
  if (gpuDeviceMap.has(thisObject)) {
    const device = gpuDeviceMap.get(thisObject)!;
    Promise.all([
      device.popErrorScope(),
      device.popErrorScope(),
      device.popErrorScope()
    ]).then(errors => {
      // Expects error message is not empty if non-null
      const message = errors.filter(e => e !== null).map(e => e.message).join('\n');
      if (message !== '') {
        if (errorCallback !== undefined) {
          // Should we pass an array of GPUErrors?
          errorCallback(new Error(message));
        }
        historyManager.setErrorMessage(historyId, message);
      }
    });
  }
};

export function callFunction<T>(
  thisObject: any,
  func: Function,
  functionName: string,
  args: IArguments,
  stackTrace: string[],
  successCallback?: (result: T) => void,
  errorCallback?: (error: Error) => void
): T {
  const historyId = historyManager.add(thisObject, functionName, args, stackTrace);

  let result;

  try {
    setup(thisObject);
    result = func.apply(thisObject, args);
    if (successCallback !== undefined) {
      successCallback(result);
    }
    historyManager.setResult(historyId, result);
  } catch (e) {
    if (errorCallback !== undefined) {
      errorCallback(e);
    }
    historyManager.setErrorMessage(historyId, e.message);
    throw e;
  } finally {
    tearDown(thisObject, historyId, errorCallback);
  }

  return result;
}

export function callFunctionAsync<T>(
  thisObject: any,
  func: Function,
  functionName: string,
  args: IArguments,
  stackTrace: string[],
  successCallback?: (result: T) => void,
  errorCallback?: (error: Error) => void
): Promise<T> {
  const historyId = historyManager.add(thisObject, functionName, args, stackTrace);

  let promise;

  try {
    setup(thisObject);
    promise = func.apply(thisObject, args);
  } catch (e) {
    if (errorCallback !== undefined) {
      errorCallback(e);
    }
    historyManager.setErrorMessage(historyId, e.message);
    throw e;
  } finally {
    tearDown(thisObject, historyId);
  }

  promise.then((result: any): void => {
    if (successCallback !== undefined) {
      successCallback(result);
    }
    historyManager.setResult(historyId, result);
  }).catch ((e: Error): void => {
    if (errorCallback !== undefined) {
      errorCallback(e);
    }
    historyManager.setErrorMessage(historyId, e.message);
    throw e;
  });

  return promise;
}

export function callCustomFunction<T>(
  thisObject: any,
  func: () => T,
  functionName: string,
  args: IArguments,
  stackTrace: string[],
  successCallback?: (result: T) => void,
  errorCallback?: (error: Error) => void
): T {
  const historyId = historyManager.add(thisObject, functionName, args, stackTrace);

  let result;

  try {
    setup(thisObject);
    result = func();
    if (successCallback !== undefined) {
      successCallback(result);
    }
    historyManager.setResult(historyId, result);
  } catch (e) {
    if (errorCallback !== undefined) {
      errorCallback(e);
    }
    historyManager.setErrorMessage(historyId, e.message);
    throw e;
  } finally {
    tearDown(thisObject, historyId);
  }

  return result;
}
