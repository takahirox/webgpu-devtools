// TODO: Think of more efficient way to receive and handle texture content
export const readUrlAsImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((
    resolve: (img: HTMLImageElement) => void,
    reject: OnErrorEventHandlerNonNull
  ): void => {
    const img = document.createElement('img');
    img.onload = (): void => {
      // TODO: Remove magic numbers 160 and 120
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
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
};
