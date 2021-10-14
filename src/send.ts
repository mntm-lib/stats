import type { Params, Provider } from './types.js';

/**
 * Chains all providers into one
 *
 * @param providers All implemented providers
 */
export const createSend = (providers: Provider[]) => {
  return (event: string, params?: Params | undefined) => {
    const payload = params || {};
    const chain = providers.map((provider) => provider.send(event, payload));

    return Promise.all(chain);
  };
};
