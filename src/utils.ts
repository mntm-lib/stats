import { safeDocument, safeWindow } from './dom.js';

// Internal
export const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    // Wait execute
    const onSuccess = () => safeWindow.setTimeout(resolve, 0);
    const onFail = () => safeWindow.setTimeout(reject, 0);

    // Dont block event loop
    safeWindow.requestAnimationFrame(() => {
      safeDocument.body.appendChild(Object.assign(safeDocument.createElement('script'), {
        src,
        type: 'text/javascript',
        async: true,
        onload: onSuccess,
        onabort: onFail,
        onerror: onFail
      }));
    });
  });
};

export const thenable = (ready: Promise<void>, fn: () => void) => {
  return ready.then(() => {
    fn();

    return true;
  }).catch(() => {
    return false;
  });
};
