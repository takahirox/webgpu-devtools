const port = chrome.runtime.connect(null, {name: 'devtools'});

chrome.devtools.panels.create(
  "WebGPU",
  null,
  "/panel.html"
);
