const _useOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
const _canvas = _useOffscreenCanvas
  ? new OffscreenCanvas(1, 1) as OffscreenCanvas
  : document.createElement('canvas');
const contextCreationOption = {
  willReadFrequently: true
};
const _context = _useOffscreenCanvas
  ? _canvas.getContext('2d', contextCreationOption) as OffscreenCanvasRenderingContext2D
  : _canvas.getContext('2d', contextCreationOption) as CanvasRenderingContext2D;

// TODO: Make async? But what if the texture is destroyed before cloning done?
export const cloneImageSourceAsImageData = (
  source: ImageBitmap | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas
) : ImageData => {
  _canvas.width = source.width;
  _canvas.height = source.height;
  _context.drawImage(source, 0, 0);
  return _context.getImageData(0, 0, source.width, source.height);
};