const port = chrome.runtime.connect({name: 'contentScript'});

const script = document.createElement('script');
script.src = chrome.runtime.getURL('webgpu-devtools.bundle.js');
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

const dispatchCustomEvent = (type, detail) => {
  window.dispatchEvent(new CustomEvent(type, {
    detail: typeof cloneInto !== 'undefined' ? cloneInto(detail, window) : detail
  }));
};

window.addEventListener('webgpu-devtools-function-call', event => {
  port.postMessage({
    action: 'function-call',
    name: event.detail.name
  });
}, false);

window.addEventListener('webgpu-devtools-texture-image', event => {
  const imageData = event.detail.imageData;
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    port.postMessage({
      action: 'texture-image',
      url: url
    });
  });
}, false);

window.addEventListener('webgpu-devtools-buffer-data', event => {
  const data = event.detail.data;
  const blob = new Blob([data], {type: 'application/octet-stream'});
  const url = URL.createObjectURL(blob);
  port.postMessage({
    action: 'buffer-data',
    url: url
  });
}, false);

port.postMessage({
  action: 'onLoad'
});
