import type { Provider } from '../types.js';

import { loadScript, thenable } from '../utils.js';
import { launchParams } from '../launch.js';

type UACallable = (...params: unknown[]) => void;
type UAImplementation = {
  loaded: boolean;
  q: Array<Parameters<UACallable>>;
  l: number;
};

type UA = UACallable & UAImplementation;

type UAContext = {
  ua: UA;
  GoogleAnalyticsObject: 'ua';
};

/**
 * Implements Universal Analytics
 *
 * @param code UA-XXXXXXX
 */
export const createProviderUA = (code: string): Provider => {
  const context = window as unknown as UAContext;

  context.GoogleAnalyticsObject = 'ua';
  context.ua = Object.assign(function ua() {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments as unknown as Parameters<UACallable>;

    context.ua.q.push(args);
  }, {
    loaded: false,
    q: [],
    l: Date.now()
  });

  context.ua('create', {
    userId: launchParams.vk_user_id,
    trackingId: code,

    // Disable cookie
    storage: 'none',
    storeGac: false,
    legacyHistoryImport: false
  });

  const load = loadScript(`https://www.google-analytics.com/analytics.js`);
  const ready = load.then(() => {
    if (context.ua.loaded) {
      context.ua('send', 'pageview');
    } else {
      throw new Error('net::ERR_BLOCKED_BY_CLIENT');
    }
  });

  const provider: Provider = {
    send(event, params) {
      return thenable(ready, () => {
        context.ua('send', {
          hitType: 'event',
          eventCategory: params.category || 'main',
          eventAction: event,
          eventLabel: params.label || '',
          screenName: params.screen || 'unknown'
        });
      });
    }
  };

  return provider;
};
