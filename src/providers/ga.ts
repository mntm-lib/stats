import type { Provider } from '../types.js';

import { loadScript, thenable } from '../utils.js';
import { launchParams } from '../launch.js';
import { safeWindow } from '../dom.js';

type GAContext = {
  ga: unknown[];
  gtag: (...params: unknown[]) => void;
};

/**
 * Implements Google Analytics
 *
 * @param code G-XXXXXXX
 */
export const createProviderGA = (code: string): Provider => {
  const context = safeWindow as unknown as GAContext;

  context.ga = context.ga || [];
  context.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;

    context.ga.push(args);
  };

  context.gtag('js', new Date());
  context.gtag('consent', 'default', {
    // Disable cookie (Modern)
    ad_storage: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 0
  });
  context.gtag('config', code, {
    user_id: launchParams.vk_user_id,

    // Disable cookie (Legacy)
    storage: 'none',
    client_storage: 'none'
  });
  context.gtag('set', 'user_properties', {
    crm_id: launchParams.vk_user_id
  });

  const load = loadScript(`https://www.googletagmanager.com/gtag/js?id=${code}&l=ga`);
  const ready = load.then(() => {
    if (context.ga.push === Array.prototype.push) {
      throw new Error('net::ERR_BLOCKED_BY_CLIENT');
    }
  });

  const provider: Provider = {
    send(event, params) {
      return thenable(ready, () => {
        context.gtag('event', event, {
          event_category: params.category || 'main',
          event_label: params.label || '',
          screen_name: params.screen || 'unknown'
        });
      });
    }
  };

  return provider;
};
