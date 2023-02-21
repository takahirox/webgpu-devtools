import { PortNames } from "../common/messages";

type Port = chrome.runtime.Port;

const connections = new Map<string, Map<string, Port[]>>();

chrome.runtime.onConnect.addListener((port: Port): void => {
  port.onMessage.addListener((message: any, port: Port): void => {
    const tabId = message.tabId !== undefined ? message.tabId : port.sender.tab.id;

    if (!connections.has(tabId)) {
      connections.set(tabId, new Map<string, Port[]>());
    }

    const portMap = connections.get(tabId);

    // Can be multiple content scripts per tab
    // for example if a web page includes iframe.
    // So manage ports as an array.
    if (!portMap.has(port.name)) {
      portMap.set(port.name, []);
    }

    const ports = portMap.get(port.name);

    if (!ports.includes(port)) {
      ports.push(port);
      port.onDisconnect.addListener((): void => {
        if (ports.includes(port)) {
          ports.splice(ports.indexOf(port), 1);
        }
        if (ports.length === 0) {
          portMap.delete(port.name);
        }
        if (portMap.size === 0) {
          connections.delete(tabId);
        }
      });
    }

    // transfer message between panel and contentScripts of the same tab

    if (port.name === PortNames.Panel && portMap.has(PortNames.ContentScript)) {
      postMessageToPorts(portMap.get(PortNames.ContentScript), message);
    }
    if (port.name === PortNames.ContentScript && portMap.has(PortNames.Panel)) {
      postMessageToPorts(portMap.get(PortNames.Panel), message);
    }
  });
});

const postMessageToPorts = (ports: Port[], message: any): void => {
  ports.forEach((port: Port): void => {
    port.postMessage(message);
  });
};
