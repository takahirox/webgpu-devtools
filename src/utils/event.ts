// TODO: Avoid any
export const dispatchCustomEvent = (type: string, detail: any) => {
  window.dispatchEvent(new CustomEvent(type, {
    // TODO: use cloneInto for Firefox
    detail: detail
  }));
};
