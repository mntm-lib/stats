/**
 * Parses any query string
 */
export const parseParams = (from: string) => {
  const params: Record<string, string> = {};
  let match = null;
  const paramsRegex = /([\w-]+)=([\w-]+)/g;

  while ((match = paramsRegex.exec(from)) !== null) {
    params[match[1]] = match[2];
  }

  return params;
};

/**
 * Launch path
 * @see location.pathname docs
 * @noinline
 */
export const path = /*#__NOINLINE__*/window.location.pathname;

/**
 * Launch hash without number sign (#)
 * @see location.hash docs
 * @noinline
 */
export const hash = /*#__NOINLINE__*/window.location.hash.slice(1);

/**
 * Launch search without question mark (?)
 * @see location.search docs
 * @noinline
 */
export const params = /*#__NOINLINE__*/window.location.search.slice(1);

/**
 * Parsed launch hash
 */
export const launchHash = (() => {
  if (hash === '') {
    return {};
  }

  const query = hash.indexOf('?');

  if (query === -1) {
    return parseParams(hash);
  }

  return parseParams(hash.slice(query + 1));
})();

/**
 * Parsed launch params
 */
export const launchParams = (() => {
  if (params === '') {
    return {};
  }

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

  assign += `#${hash}`;

  window.history.replaceState(null, '', assign);
};
