import { loadScript, thenable } from '../utils.js';

type FBParams = {
  content_category: string;
  content_ids: Array<string | number>;
  content_name: string;
  content_type: string;
  contents: Array<{
    id: string | number;
    quantity: number;

    [key: string]: string | number;
  }>;
  currency: string;
  num_items: number;
  predicted_ltv: number;
  search_string: string;
  status: boolean;
  value: number;
};

type FBPartialParams = Partial<FBParams>;

type FBTypesTrack = {
  AddPaymentInfo: Pick<FBPartialParams, 'content_category' | 'content_ids' | 'contents' | 'currency' | 'value'>;
  AddToCart: Pick<FBPartialParams, 'content_ids' | 'content_name' | 'content_type' | 'contents' | 'currency' | 'value'>;
  AddToWishlist: Pick<FBPartialParams, 'content_name' | 'content_category' | 'content_ids' | 'contents' | 'currency' | 'value'>;
  CompleteRegistration: Pick<FBPartialParams, 'content_name' | 'currency' | 'status' | 'value'>;
  Contact: Record<never, never>;
  CustomizeProduct: Record<never, never>;
  Donate: Record<never, never>;
  FindLocation: Record<never, never>;
  InitiateCheckout: Pick<FBPartialParams, 'content_category' | 'content_ids' | 'contents' | 'currency' | 'num_items' | 'value'>;
  Lead: Pick<FBPartialParams, 'content_category' | 'content_name' | 'currency' | 'value'>;
  PageView: Record<never, never>;
  Purchase: Pick<FBPartialParams, 'content_ids' | 'content_name' | 'content_type' | 'contents' | 'num_items'> & Pick<FBParams, 'currency' | 'value'>;
  Schedule: Record<never, never>;
  Search: Pick<FBPartialParams, 'content_category' | 'content_ids' | 'contents' | 'currency' | 'search_string' | 'value'>;
  StartTrial: Pick<FBPartialParams, 'currency' | 'predicted_ltv' | 'value'>;
  SubmitApplication: Record<never, never>;
  Subscribe: Pick<FBPartialParams, 'currency' | 'predicted_ltv' | 'value'>;
  ViewContent: Pick<FBPartialParams, 'content_ids' | 'content_category' | 'content_name' | 'content_type' | 'contents' | 'currency' | 'value'>;
};

type FBTypesCustom = Record<string, Record<string, unknown>>;

type FBPixel = {
  track: <T extends keyof FBTypesTrack>(event: T, params?: FBTypesTrack[T] | undefined) => Promise<boolean>;
  custom: <T extends keyof FBTypesCustom>(event: T, params?: FBTypesCustom[T] | undefined) => Promise<boolean>;
};

type FBCallable = (track: string, event: string, params: Record<string, unknown>) => void;
type FBImplementation = {
  loaded: boolean;
  version: string;
  push: FBCallable;
  callMethod?: FBCallable;
  queue: Array<Parameters<FBCallable>>;
};

type FBQ = FBCallable & FBImplementation;

type FBContext = {
  fbq: FBQ;
  _fbq: FBQ;
};

/**
 * Implement FB Pixel
 *
 * @param code XXXXXXX
 */
export const createPixelFB = (code: string) => {
  const context = window as unknown as FBContext;

  const callable = function(this: FBQ) {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments as unknown as Parameters<FBCallable>;

    if (this.callMethod) {
      this.callMethod.apply(this, args);
    } else {
      this.queue.push(args);
    }
  };

  const fbq: FBQ = Object.assign(callable, {
    push: callable,
    loaded: true,
    version: '2.0',
    queue: []
  });

  context.fbq = fbq;
  context._fbq = fbq;

  const load = loadScript('https://connect.facebook.net/en_US/fbevents.js');
  const ready = load.then(() => {
    fbq('init', code, {});
    fbq('track', 'PageView', {});
  });

  const pixel: FBPixel = {
    track(event, params) {
      return thenable(ready, () => {
        fbq('track', event, params || {});
      });
    },
    custom(event, params) {
      return thenable(ready, () => {
        fbq('trackCustom', event, params || {});
      });
    }
  };

  return pixel;
};
