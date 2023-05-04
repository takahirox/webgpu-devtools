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
/*!******************************************!*\
  !*** ./src/extensions/content-script.ts ***!
  \******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _common_messages__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/messages */ "./src/common/messages.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

if ('gpu' in navigator) {
    const port = chrome.runtime.connect({ name: _common_messages__WEBPACK_IMPORTED_MODULE_0__.PortNames.ContentScript });
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('webgpu-devtools.bundle.js');
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.FunctionCall, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.FunctionCall,
            name: event.detail.name
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Buffer, (event) => {
        const buffer = event.detail.buffer;
        if (buffer.content !== undefined) {
            buffer.content = (0,_common_messages__WEBPACK_IMPORTED_MODULE_0__.toURLFromArrayBuffer)(buffer.content);
        }
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Buffer,
            buffer
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Gpu, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Gpu,
            gpu: event.detail.gpu
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuAdapter, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuAdapter,
            adapter: event.detail.adapter
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuBindGroup, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuBindGroup,
            bindGroup: event.detail.bindGroup
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuBindGroupLayout, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuBindGroupLayout,
            bindGroupLayout: event.detail.bindGroupLayout
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuCanvasContext, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuCanvasContext,
            canvasContext: event.detail.canvasContext
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuComputePipeline, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuComputePipeline,
            computePipeline: event.detail.computePipeline
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuCommandEncoder, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuCommandEncoder,
            commandEncoder: event.detail.commandEncoder
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuComputePassEncoder, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuComputePassEncoder,
            computePassEncoder: event.detail.computePassEncoder
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuDevice, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuDevice,
            device: event.detail.device
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuPipelineLayout, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuPipelineLayout,
            pipelineLayout: event.detail.pipelineLayout
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuQueue, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuQueue,
            queue: event.detail.queue
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderBundle, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderBundle,
            renderBundle: event.detail.renderBundle
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderBundleEncoder, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderBundleEncoder,
            renderBundleEncoder: event.detail.renderBundleEncoder
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderPassEncoder, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderPassEncoder,
            renderPassEncoder: event.detail.renderPassEncoder
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderPipeline, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuRenderPipeline,
            renderPipeline: event.detail.renderPipeline
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuSampler, (event) => {
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.GpuSampler,
            sampler: event.detail.sampler
        });
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.ShaderModule, (event) => {
        const shaderModule = event.detail.shaderModule;
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.ShaderModule,
            shaderModule
        });
    }, false);
    // TODO: Avoid any
    const textureQueue = [];
    const postTextures = () => __awaiter(void 0, void 0, void 0, function* () {
        while (textureQueue.length > 0) {
            const texture = textureQueue[0];
            if (texture.content !== undefined) {
                texture.content = yield (0,_common_messages__WEBPACK_IMPORTED_MODULE_0__.toURLFromImageData)(texture.content);
            }
            port.postMessage({
                action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Texture,
                texture
            });
            textureQueue.shift();
        }
    });
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Texture, (event) => {
        textureQueue.push(event.detail.texture);
        if (textureQueue.length === 1) {
            postTextures();
        }
    }, false);
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.TextureView, (event) => {
        const textureView = event.detail.textureView;
        port.postMessage({
            action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.TextureView,
            textureView
        });
    }, false);
    // TODO: Rewrite more elegantly
    // TODO: Avoid any
    const traverseAndConvertArrayBufferToURL = (data) => {
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                data[i] = traverseAndConvertArrayBufferToURL(data[i]);
            }
        }
        else if (typeof data === 'object') {
            if (data.isArrayBuffer === true || data.isTypedArray === true) {
                data.content = (0,_common_messages__WEBPACK_IMPORTED_MODULE_0__.toURLFromArrayBuffer)(data.content);
            }
            else {
                for (const key in data) {
                    data[key] = traverseAndConvertArrayBufferToURL(data[key]);
                }
            }
        }
        return data;
    };
    // TODO: Avoid any
    const frameQueue = [];
    const postFrames = () => __awaiter(void 0, void 0, void 0, function* () {
        while (frameQueue.length > 0) {
            const frame = frameQueue[0];
            const pending = [];
            if (frame.framebuffer !== undefined &&
                frame.framebuffer.content !== undefined) {
                pending.push((0,_common_messages__WEBPACK_IMPORTED_MODULE_0__.toURLFromImageData)(frame.framebuffer.content)
                    .then((url) => {
                    frame.framebuffer.content = url;
                }));
            }
            for (const command of frame.commands) {
                for (let i = 0; i < command.args.length; i++) {
                    command.args[i] = traverseAndConvertArrayBufferToURL(command.args[i]);
                }
                command.result = traverseAndConvertArrayBufferToURL(command.result);
            }
            yield Promise.all(pending);
            port.postMessage({
                action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Frame,
                frame
            });
            frameQueue.shift();
        }
    });
    window.addEventListener(_common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Frame, (event) => {
        frameQueue.push(event.detail.frame);
        if (frameQueue.length === 1) {
            postFrames();
        }
    }, false);
    port.postMessage({
        action: _common_messages__WEBPACK_IMPORTED_MODULE_0__.Actions.Loaded
    });
}

})();

/******/ })()
;