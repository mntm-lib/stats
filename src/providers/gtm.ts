import type { Provider } from '../types.js';

import { loadScript, thenable } from '../utils.js';
import { launchParams } from '../launch.js';

type GTMContext = {
  gtm: unknown[];
};

/**
 * Implements Google Tag Manager
 *
 * @param code GTM-XXXXXXX
 */
export const createProviderGTM = (code: string): Provider => {
  const context = window as unknown as GTMContext;

  context.gtm = context.gtm || [];
  context.gtm.push({
    'gtm.start': Date.now(),
    'event': 'gtm.js'
  });
  context.gtm.push({
    userId: launchParams.vk_user_id
  });

  const load = loadScript(`https://www.googletagmanager.com/gtm.js?id=${code}&l=gtm`);
  const ready = load.then(() => {
    if (context.gtm.push === Array.prototype.push) {
      throw new Error('net::ERR_BLOCKED_BY_CLIENT');
    }
  });

  const provider: Provider = {
    send(event, params) {
      return thenable(ready, () => {
        context.gtm.push({
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
