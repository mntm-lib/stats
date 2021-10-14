// Internal
export const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    // Wait execute
    const onSuccess = () => setTimeout(resolve, 0);
    const onFail = () => setTimeout(reject, 0);

    // Dont block event loop
    requestAnimationFrame(() => {
      document.body.appendChild(Object.assign(document.createElement('script'), {
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
