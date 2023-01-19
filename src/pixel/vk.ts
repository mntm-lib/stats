import { safeWindow } from '../dom.js';
import { loadScript, thenable } from '../utils.js';

type VKProductEvent =
  'view_home' |
  'view_category' |
  'view_product' |
  'view_search' |
  'view_other' |
  'add_to_wishlist' |
  'add_to_cart' |
  'remove_from_wishlist' |
  'remove_from_cart' |
  'init_checkout' |
  'add_payment_info' |
  'purchase';

type VKProduct = Partial<{
  id: string;
  group_id: string;
  recommended_ids: string;
  price: number;
  price_old: number;
  price_from: boolean;
}>;

type VKProductPrams = Partial<{
  products: VKProduct[];
  products_recommended_ids: string;
  category_ids: string;
  business_value: number;
  currency_code: string;
  total_price: number;
  search_string: string;
}>;

type VKGoalEvent =
  'add_to_cart' |
  'add_to_wishlist' |
  'customize_product' |
  'initiate_checkout' |
  'add_payment_info' |
  'purchase' |
  'contact' |
  'lead' |
  'schedule' |
  'complete_registration' |
  'submit_application' |
  'start_trial' |
  'subscribe' |
  'page_view' |
  'view_content' |
  'search' |
  'find_location' |
  'donate' |
  'conversion';

type VKGoalParams = {
  value: number;
};

type VKContext = {
  VK: {
    Retargeting: {
      Init: (code: string) => void;
      Hit: () => void;
      Event: (event: string) => void;
      ProductEvent: (id: number, event: string, params: Record<string, unknown>) => void;
      Add: (id: number) => void;
    };
    Goal: (goal: string, params: VKGoalParams) => void;
  };
};

type VKPixel = {
  hit: () => Promise<boolean>;
  event: (event: string) => Promise<boolean>;
  audience: (id: number) => Promise<boolean>;
  product: (id: number, event: VKProductEvent, params?: VKProductPrams) => Promise<boolean>;
  goal: (goal: VKGoalEvent, value?: number) => Promise<boolean>;
};

/**
 * Implement VK Pixel
 *
 * @param code VK-RTRG-XXXXXXX-YYYYY
 */
export const createPixelVK = (code: string) => {
  /* eslint-disable new-cap */

  const context = safeWindow as unknown as VKContext;

  const load = loadScript('https://vk.com/js/api/openapi.js?169');
  const ready = load.then(() => {
    if (context.VK) {
      context.VK.Retargeting.Init(code);
    } else {
      throw new Error('net::ERR_BLOCKED_BY_CLIENT');
    }
  });

  const pixel: VKPixel = {
    hit() {
      return thenable(ready, () => {
        context.VK.Retargeting.Hit();
      });
    },
    event(event) {
      return thenable(ready, () => {
        context.VK.Retargeting.Event(event);
      });
    },
    product(id, event, params) {
      return thenable(ready, () => {
        context.VK.Retargeting.ProductEvent(id, event, params || {});
      });
    },
    audience(id) {
      return thenable(ready, () => {
        context.VK.Retargeting.Add(id);
      });
    },
    goal(goal, value) {
      return thenable(ready, () => {
        context.VK.Goal(goal, { value: value || 0 });
      });
    }
  };

  return pixel;
};
