// These might be Chrome specific?
// TODO: Check and add workaround for other browsers if needed.

export const getStackTraceAsString = (excludedTopmost: Function): string[] => {
  // TODO: Avoid any
  const error = {stack: undefined} as any;
  Error.captureStackTrace(error, excludedTopmost);
  return parseStackTraceString(error.stack || '');
};

export const parseStackTraceString = (str: string): string[] => {
  // Expects input string as like
  //
  // Error
  //   at WebGPURenderer.init (https://threejs.org/examples/jsm/renderers/webgpu/WebGPURenderer.js:206:95)
  //   at async WebGPURenderer.render (https://threejs.org/examples/jsm/renderers/webgpu/WebGPURenderer.js:258:38)
  return (str.match(/^\s*at\s+.*$/gm) || [])
           .map(str => str.replace(/^\s*at\s+/, ''));
};
