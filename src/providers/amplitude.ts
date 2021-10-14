import type { Provider } from '../types.js';
import type { AmplitudeClient } from 'amplitude-js';

import { loadScript, thenable } from '../utils.js';
import { launchParams } from '../launch.js';

type Context = {
  amplitude?: {
    getInstance?: (name: string) => AmplitudeClient;
  };
};

/**
 * Implements Amplitude
 *
 * @param code XXXXXXX
 */
export const createProviderAMP = (code: string) => {
  const context = window as unknown as Context;

  let logEvent: AmplitudeClient['logEvent'] | null = null;

  const load = loadScript('https://cdn.amplitude.com/libs/amplitude-8.5.0-min.gz.js');
  const ready = load.then(() => {
    if (context.amplitude && context.amplitude.getInstance) {
      const instance = context.amplitude.getInstance('$default_instance');

      instance.init(code, launchParams.vk_user_id, {
        includeUtm: true
      });

      logEvent = instance.logEvent.bind(instance);
    } else {
      throw new Error('net::ERR_BLOCKED_BY_CLIENT');
    }
  });

  const provider: Provider = {
    send(event, params) {
      return thenable(ready, () => {
        logEvent!(event, params.params);
      });
    }
  };

  return provider;
};
