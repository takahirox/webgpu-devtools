const port = chrome.runtime.connect(null, {name: 'panel'});
const tabId = chrome.devtools.inspectedWindow.tabId;

port.onMessage.addListener(message => {
  if (message.action === 'function-call') {
    const div = document.createElement('div');
    div.innerText = `${message.name}`;
    document.getElementById('content').appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
  } else if (message.action === 'texture-image') {
    const url = message.url;
    const div = document.createElement('div');
    const img = document.createElement('img');

    img.onload = () => {
      if (img.width > img.height) {
        const newWidth = Math.min(img.width, 160);
        const ratio = newWidth / img.width;
        img.width = Math.floor(img.width * ratio);
        img.height = Math.floor(img.height * ratio);
      } else {
        const newHeight = Math.min(img.height, 120);
        const ratio = newHeight / img.height;
        img.width = Math.floor(img.width * ratio);
        img.height = Math.floor(img.height * ratio);
      }
      div.appendChild(img);
      window.scrollTo(0, document.body.scrollHeight);
    };
    img.src = url;
    document.getElementById('content').appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
  } else if (message.action === 'buffer-data') {
    const url = message.url;
    const div = document.createElement('div');
    fetch(url).then(response => response.arrayBuffer()).then(buffer => {
      const array = new Float32Array(buffer);
      div.innerText = array;
    });
    document.getElementById('content').appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
  }
});

document.getElementById('resetButton').addEventListener('click', () => {
  const contentDiv = document.getElementById('content');
  while (contentDiv.firstChild) {
    contentDiv.removeChild(contentDiv.firstChild);
  }
});

port.postMessage({
  action: 'onLoad',
  tabId: tabId
});
