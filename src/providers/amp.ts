import type { Provider } from '../types.js';
import type { AmplitudeClient } from 'amplitude-js';

import { loadScript, thenable } from '../utils.js';
import { launchParams } from '../launch.js';
import { safeWindow } from '../dom.js';

type AmplitudeContext = {
  amplitude: {
    getInstance?: (name: string) => AmplitudeClient;
  };
};

/**
 * Implements Amplitude
 *
 * @param code XXXXXXX
 */
export const createProviderAMP = (code: string) => {
  const context = safeWindow as unknown as AmplitudeContext;

  context.amplitude = context.amplitude || {};

  let instance: AmplitudeClient | null = null;

  const load = loadScript('https://cdn.amplitude.com/libs/amplitude-8.21.4-min.gz.js');
  const ready = load.then(() => {
    if (context.amplitude && context.amplitude.getInstance) {
      instance = context.amplitude.getInstance('$default_instance');

      instance.init(code, launchParams.vk_user_id, {
        userId: launchParams.vk_user_id,
        includeUtm: true
      });
    } else {
      throw new Error('net::ERR_BLOCKED_BY_CLIENT');
    }
  });

  const provider: Provider = {
    send(event, params) {
      return thenable(ready, () => {
        instance!.logEvent(event, params.params);
      });
    }
  };

  return provider;
};
