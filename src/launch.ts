import { safeDocument, safeWindow } from './dom.js';

/**
 * Parses any query string
 */
export const parseParams = (from: string) => {
  const params: Record<string, string> = {};

  if (from === '') {
    return params;
  }

  let match = null;
  const paramsRegex = /([^&=?]+)(?:=([^&]*))?/g;

  while ((match = paramsRegex.exec(from)) !== null) {
    params[match[1]] = match[2] || '';
  }

  return params;
};

/**
 * Launch path
 * @see location.pathname docs
 * @noinline
 */
export const path = /*#__NOINLINE__*/safeWindow.location.pathname;

/**
 * Launch hash without number sign (#)
 * @see location.hash docs
 * @noinline
 */
export const hash = /*#__NOINLINE__*/safeWindow.location.hash.slice(1);

/**
 * Launch search without question mark (?)
 * @see location.search docs
 * @noinline
 */
export const params = /*#__NOINLINE__*/safeWindow.location.search.slice(1);

/**
 * Parsed launch hash
 */
export const launchHash = (() => {
  if (hash === '') {
    return {};
  }

  const hashQuery = hash.indexOf('?');

  if (hashQuery !== -1) {
    return parseParams(hash.slice(hashQuery + 1));
  }

  const hashPath = hash.indexOf('/');

  if (hashPath !== -1) {
    return {};
  }

  return parseParams(hash);
})();

/**
 * Parsed launch params
 */
export const launchParams = (() => {
  if (params === '') {
    return {};
  }

  // TODO: check params

  return parseParams(params);
})();

/**
 * Reassigns all query params, for example, for hash UTM tags.
 * @warn Must be called before initializing the sending and the router.
 */
export const prepareParams = () => {
  const launch = Object.assign({}, launchParams, launchHash);
  let assign = path;

  for (const key in launch) {
    if (assign === path) {
      assign += '?';
    } else {
      assign += '&';
    }

    assign += `${key}=${launch[key]}`;
  }

  if (hash !== '') {
    assign += `#${hash}`;
  }

  safeWindow.history.replaceState(safeWindow.history.state, safeDocument.title, assign);
};
