import { loadScript, thenable } from '../utils.js';

type Params = {
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

type PartialParams = Partial<Params>;

type TypesTrack = {
  AddPaymentInfo: Pick<PartialParams, 'content_category' | 'content_ids' | 'contents' | 'currency' | 'value'>;
  AddToCart: Pick<PartialParams, 'content_ids' | 'content_name' | 'content_type' | 'contents' | 'currency' | 'value'>;
  AddToWishlist: Pick<PartialParams, 'content_name' | 'content_category' | 'content_ids' | 'contents' | 'currency' | 'value'>;
  CompleteRegistration: Pick<PartialParams, 'content_name' | 'currency' | 'status' | 'value'>;
  Contact: Record<never, never>;
  CustomizeProduct: Record<never, never>;
  Donate: Record<never, never>;
  FindLocation: Record<never, never>;
  InitiateCheckout: Pick<PartialParams, 'content_category' | 'content_ids' | 'contents' | 'currency' | 'num_items' | 'value'>;
  Lead: Pick<PartialParams, 'content_category' | 'content_name' | 'currency' | 'value'>;
  PageView: Record<never, never>;
  Purchase: Pick<PartialParams, 'content_ids' | 'content_name' | 'content_type' | 'contents' | 'num_items'> & Pick<Params, 'currency' | 'value'>;
  Schedule: Record<never, never>;
  Search: Pick<PartialParams, 'content_category' | 'content_ids' | 'contents' | 'currency' | 'search_string' | 'value'>;
  StartTrial: Pick<PartialParams, 'currency' | 'predicted_ltv' | 'value'>;
  SubmitApplication: Record<never, never>;
  Subscribe: Pick<PartialParams, 'currency' | 'predicted_ltv' | 'value'>;
  ViewContent: Pick<PartialParams, 'content_ids' | 'content_category' | 'content_name' | 'content_type' | 'contents' | 'currency' | 'value'>;
};

type TypesCustom = Record<string, Record<string, unknown>>;

type Pixel = {
  track: <T extends keyof TypesTrack>(event: T, params?: TypesTrack[T] | undefined) => Promise<boolean>;
  custom: <T extends keyof TypesCustom>(event: T, params?: TypesCustom[T] | undefined) => Promise<boolean>;
};

type Callable = (track: string, event: string, params: Record<string, unknown>) => void;
type Implementation = {
  loaded: boolean;
  version: string;
  push: Callable;
  callMethod?: Callable;
  queue: Array<Parameters<Callable>>;
};

type FBQ = Callable & Implementation;

type Context = {
  fbq: FBQ;
  _fbq: FBQ;
};

/**
 * Implement Facebook Pixel
 *
 * @param code XXXXXXX
 */
export const createPixelFB = (code: string) => {
  const context = window as unknown as Context;

  const callable = function(this: FBQ) {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments as unknown as Parameters<Callable>;

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

  const pixel: Pixel = {
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
