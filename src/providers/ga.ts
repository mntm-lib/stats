import type { Provider } from '../types.js';

import { loadScript, thenable } from '../utils.js';
import { launchParams } from '../launch.js';

type GAInit = Partial<{
  ad_storage: 'allowed' | 'denied';
  analytics_storage: 'allowed' | 'denied';
}>;

type GAContext = {
  ga: unknown[];
  gtag: (...params: unknown[]) => void;
};

/**
 * Implements Google Analytics
 *
 * @param code G-XXXXXXX
 */
export const createProviderGA = (code: string, init: GAInit): Provider => {
  const context = window as unknown as GAContext;

  context.ga = context.ga || [];
  context.gtag = function(this: GAContext) {
    // eslint-disable-next-line prefer-rest-params
    context.ga.push(arguments);
  };

  context.gtag('consent', 'default', init);
  context.gtag('js', new Date());
  context.gtag('config', code, {
    user_id: launchParams.vk_user_id
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
          event_category: params.category,
          event_label: params.label,
          screen_name: params.screen || 'unknown'
        });
      });
    }
  };

  return provider;
};
