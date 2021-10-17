# @mntm/stats [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/maxi-team/stats/blob/master/LICENSE) [![npm bundle size](https://img.shields.io/bundlephobia/min/@mntm/stats)](https://bundlephobia.com/result?p=@mntm/stats)

> Inspired by [vk-stat](https://github.com/denismart/vk-stat)

A package for integrating analytics tools.

## Implemented providers

- [VK Statistics](https://vk.com/dev/statEvents.addMiniApps)
- [Google Tag Manager](https://tagmanager.google.com)
- [Amplitude](https://amplitude.com)
- [Yandex Metrika](https://metrika.yandex.ru)
- [Google Analytics](https://analytics.google.com)

## Implemented pixels

- [VK Pixel](https://vk.com/faq12142)
- [Facebook Pixel](https://www.facebook.com/business/learn/facebook-ads-pixel)

## Prepare

### [GTM] Google Tag Manager

When using Universal Analytics with GTM, need set `storage:none`. Without these settings will not work GA, when you install GTM in iframe.

### [VK] VK Statistics

You need request permissions for `statEvents.addMiniApps` in [miniapps](http://vk.link/miniapps) with `mini_app_id`.

## Installation

We recommend to use [yarn](https://classic.yarnpkg.com/en/docs/install/) for dependency management:

```shell
yarn add @mntm/stats
```

## Event params

```typescript
{
  // [GTM|GA|VK] event category
  category: string;

  // [GTM|GA] event label
  label: string;

  // [VK|GA|YM] screen where event occurred
  screen: string;

  // [VK|AMP] additional parameters
  params: Record<string, unknown>;
}
```

## Usage

```typescript
import {
  prepareParams,
  createProviderGTM,
  createSend
} from '@mntm/stats';

// Re-assigns all query params, for example, for UTM tags.
prepareParams();

// Create send function
const sendStats = createSend([
  createProviderGTM('GTM-XXXXXXX')
]);

// Send event to all providers
sendStats('launch', {
  label: 'web_app'
});
```

## VK API implementation

Need for VK Statistics provider:

```typescript
// See @mntm/painless-bridge for enhanced bridge implementation
import bridge from '@vkontakte/vk-bridge';

// Early token initialization
const token = bridge.send('VKWebAppGetAuthToken', {
  // Your app_id
  app_id: 7415273,
  scope: ''
});

// Example of reuseable implementation
const api = async (method: string, params: Record<string, unknown>) => {
  const { access_token } = await token;

  const result = await bridge.send('VKWebAppCallAPIMethod', {
    method,
    params: Object.assign({
      access_token,
      v: '5.160'
    }, params);
  });

  return result;
};
```

## Contributing

Development of @mntm/stats happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements.

## License

@mntm/stats is [MIT licensed](./LICENSE).
