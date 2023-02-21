const script = document.createElement('script');
script.src = chrome.runtime.getURL('webgpu-devtools.bundle.js');
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);
