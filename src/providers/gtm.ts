import type { Provider } from '../types.js';

import { loadScript, thenable } from '../utils.js';

type Context = {
  dataLayer?: unknown[];
};

/**
 * Implements Google Tag Manager
 *
 * @param code GTM-XXXXXXX
 */
export const createProviderGTM = (code: string): Provider => {
  const context = window as unknown as Context;

  context.dataLayer = context.dataLayer || [];
  context.dataLayer.push({
    'gtm.start': Date.now(),
    'event': 'gtm.js'
  });

  const load = loadScript(`https://www.googletagmanager.com/gtm.js?id=${code}`);

  // TODO: check success
  const ready = load;

  const provider: Provider = {
    send(event, params) {
      return thenable(ready, () => {
        context.dataLayer!.push({
          event: 'event_gtm',
          ec: params.category || 'main',
          ea: event,
          el: params.label || ''
        });
      });
    }
  };

  return provider;
};
