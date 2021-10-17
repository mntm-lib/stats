import type { Provider } from '../types.js';

import { launchParams } from '../launch.js';

// Type inlined for easy integration
/**
 * Implements VK Statistics
 *
 * @param api Implementation of VK API
 * @see Implementation with VKWebAppCallAPIMethod and valid token
 */
export const createProviderVK = (api: (method: string, params: Record<string, any>) => Promise<any>): Provider => {
  const zone = `gtm${Math.round(-1 * new Date().getTimezoneOffset() / 60)}`;
  const app = Number(launchParams.vk_app_id) || 0;
  const user = Number(launchParams.vk_user_id) || 0;
  const platform = launchParams.vk_platform || 'unknown';

  const base = {
    type: 'type_navgo',
    type_navgo: {
      type: 'type_mini_app_custom_event_item'
    },
    timezone: zone,
    mini_app_id: app,
    user_id: user,
    vk_platform: platform
  };

  const provider: Provider = {
    send(event, params) {
      /* eslint-disable no-param-reassign */

      if (params.category) {
        event = `${params.category}--${event}`;
      }

      event += '_front';

      return api('statEvents.addMiniApps', {
        events: [Object.assign({}, base, {
          event,
          url: window.location.href,
          timestamp: Math.round(Date.now() / 1000),
          screen: params.screen || 'unknown',
          json: JSON.stringify(params.params || {})
        })]
      }).then(() => {
        return true;
      }).catch(() => {
        return false;
      });
    }
  };

  return provider;
};
