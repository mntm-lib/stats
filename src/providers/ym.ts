import type { Provider } from '../types.js';

import { loadScript, thenable } from '../utils.js';
import { launchParams } from '../launch.js';
import { safeWindow } from '../dom.js';

type YMInit = Partial<{
  clickmap: boolean;
  trackLinks: boolean;
  accurateTrackBounce: boolean;
  webvisor: boolean;
  trackHash: boolean;
}>;

type YMCallable = (...params: unknown[]) => void;
type YMImplementation = {
  a: Array<Parameters<YMCallable>>;
  l: number;
};

type YM = YMCallable & YMImplementation;

type YMContext = {
  ym: YM;
  Ya: Record<string, unknown>;
};

/**
 * Implements Yandex Metrika
 *
 * @param code XXXXXXX
 */
export const createProviderYM = (code: number, init: YMInit): Provider => {
  const context = safeWindow as unknown as YMContext;

  context.ym = Object.assign(function ym() {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments as unknown as Parameters<YMCallable>;

    context.ym.a.push(args);
  }, {
    a: [],
    l: Date.now()
  });

  context.ym(code, 'init', init);
  context.ym(code, 'setUserID', launchParams.vk_user_id);

  // Use a CDN because it seems faster
  const load = loadScript('https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js');
  const ready = load.then(() => {
    if (!context.Ya) {
      throw new Error('net::ERR_BLOCKED_BY_CLIENT');
    }
  });

  const provider: Provider = {
    send(event, params) {
      return thenable(ready, () => {
        context.ym(code, 'reachGoal', event, {
          category: params.category,
          label: params.label,
          screen: params.screen || 'unknown'
        });
      });
    }
  };

  return provider;
};
