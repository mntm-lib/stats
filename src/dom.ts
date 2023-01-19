import { getDocument, getWindow, ssrDocument, extend } from 'ssr-window';

extend(ssrDocument, {
  body: {
    appendChild: (child: unknown) => child
  }
});

export const safeDocument = getDocument();
export const safeWindow = getWindow();
