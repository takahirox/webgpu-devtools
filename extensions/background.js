/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/common/messages.ts":
/*!********************************!*\
  !*** ./src/common/messages.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Actions": () => (/* binding */ Actions),
/* harmony export */   "PortNames": () => (/* binding */ PortNames),
/* harmony export */   "toURLFromArrayBuffer": () => (/* binding */ toURLFromArrayBuffer),
/* harmony export */   "toURLFromImageData": () => (/* binding */ toURLFromImageData)
/* harmony export */ });
const prefix = 'webgpu_devtools_';
const Actions = {
    Buffer: prefix + 'buffer',
    Frame: prefix + 'frame',
    FunctionCall: prefix + 'function_call',
    Gpu: prefix + 'gpu',
    GpuAdapter: prefix + 'gpu_adapter',
    GpuBindGroup: prefix + 'gpu_bind_group',
    GpuBindGroupLayout: prefix + 'gpu_bind_group_layout',
    GpuCanvasContext: prefix + 'gpu_canvas_context',
    GpuComputePassEncoder: prefix + 'gpu_compute_pass_encoder',
    GpuComputePipeline: prefix + 'gpu_compute_pipeline',
    GpuCommandEncoder: prefix + 'gpu_command_encoder',
    GpuDevice: prefix + 'gpu_device',
    GpuPipelineLayout: prefix + 'gpu_pipeline_layout',
    GpuQueue: prefix + 'gpu_queue',
    GpuRenderBundle: prefix + 'gpu_render_bundle',
    GpuRenderBundleEncoder: prefix + 'gpu_render_bundle_encoder',
    GpuRenderPassEncoder: prefix + 'gpu_render_pass_encoder',
    GpuRenderPipeline: prefix + 'gpu_render_pipeline',
    GpuSampler: prefix + 'gpu_sampler',
    Loaded: prefix + 'loaded',
    ShaderModule: prefix + 'shader_module',
    Texture: prefix + 'texture',
    TextureView: prefix + 'texture_view'
};
const PortNames = {
    ContentScript: prefix + 'content_script',
    Panel: prefix + 'panel'
};
// ImageData is too huge to send message so convert it as URL
// TODO: Think of more efficient way to pass the texture content to panel
const toURLFromImageData = (data) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = data.width;
        canvas.height = data.height;
        const context = canvas.getContext('2d');
        context.putImageData(data, 0, 0);
        canvas.toBlob((blob) => {
            resolve(URL.createObjectURL(blob));
        });
    });
};
const toURLFromArrayBuffer = (data) => {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    return URL.createObjectURL(blob);
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**************************************!*\
  !*** ./src/extensions/background.ts ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common_messages__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");

const connections = new Map();
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message, port) => {
        const tabId = message.tabId !== undefined ? message.tabId : port.sender.tab.id;
        if (!connections.has(tabId)) {
            connections.set(tabId, new Map());
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
            port.onDisconnect.addListener(() => {
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
        if (port.name === _common_messages__WEBPACK_IMPORTED_MODULE_0__.PortNames.Panel && portMap.has(_common_messages__WEBPACK_IMPORTED_MODULE_0__.PortNames.ContentScript)) {
            postMessageToPorts(portMap.get(_common_messages__WEBPACK_IMPORTED_MODULE_0__.PortNames.ContentScript), message);
        }
        if (port.name === _common_messages__WEBPACK_IMPORTED_MODULE_0__.PortNames.ContentScript && portMap.has(_common_messages__WEBPACK_IMPORTED_MODULE_0__.PortNames.Panel)) {
            postMessageToPorts(portMap.get(_common_messages__WEBPACK_IMPORTED_MODULE_0__.PortNames.Panel), message);
        }
    });
});
const postMessageToPorts = (ports, message) => {
    ports.forEach((port) => {
        port.postMessage(message);
    });
};

})();

/******/ })()
;