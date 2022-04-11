# umijs-plugin-pwa

> Forked from [umijs-plugin-pwa](https://github.com/luoyelusheng/umijs-plugin-pwa)

[![NPM version](https://img.shields.io/npm/v/@intlgadmin/umijs-plugin-pwa.svg?style=flat)](https://npmjs.org/package/@intlgadmin/umijs-plugin-pwa) [![NPM downloads](http://img.shields.io/npm/dm/@intlgadmin/umijs-plugin-pwa.svg?style=flat)](https://npmjs.org/package/@intlgadmin/umijs-plugin-pwa)

## Getting Started

### 配置 umirc

在`.umirc.js`添加配置，示例如下，更多配置请参考[Options](#Options)

```js
export default {
  pwa: {
    src: 'manifest.json',
    autoRefresh: true,
    workboxOptions: {
      navigateFallback: '/index.html', // 支持单页应用子路由离线刷新
    },
  },
  plugins: [['@intlgadmin/umijs-plugin-pwa']],
};
```

### 配置`manifest.json`

在项目根目录配置一个`manifest.json`文件（也可以放在其他目录，注意同步调整上述`umirc`配置的`src`参数），示例如下，更多配置请参考[Web App Manifest](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)，你也可以通过`umirc`配置的`manifest`参数覆盖`manifest.json`的部分字段

```json
{
  "name": "My App",
  "short_name": "MyApp",
  "description": "This is PWA demo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "purpose": "maskable",
      "type": "image/png"
    },
    {
      "src": "/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "purpose": "maskable",
      "type": "image/png"
    }
  ]
}
```

## Options

- `appStatusBar` ios 特定值，其最终会渲染成
  ```js
  <meta name="apple-mobile-web-app-status-bar-style" content="#fff" />
  ```
- `manifest` 直接指定 pwa 的 manifest 配置值，最终会生成为 manifest.json，如果既指定了 src 路径，则会将覆盖到 src 的 manifest.json 文件中，默认 manifest 的优先级最高。
- `src` 可在 src 目录下创建`manifest.json`文件指定地址，必须为`json`文件
- `hash [boolean][default:false]` `minifest.json` 可能配置了较长的缓存，配置改变后可能无法生效，可以开启`hash`，开启效果如下
  ```js
  <link rel="manifest" type="json" href="./manifest.json?v=uuWlArby8" />
  ```
- `autoRefresh [boolean][default:false]` 检测到更新后默认需要下次启动页面才会生效，如果需要立即生效，可以开启`autoRefresh`，将会调用`location.reload()`刷新页面。你也可以通过监听`custom:sw`事件自行处理刷新逻辑，比如通过 UI 提示等用户点击确认后再刷新
- `autoLog [boolean][default:true]` 打印 service-worker 状态变化相关日志
- `workboxOptions [object]` `GenerateSWOptions`配置，详见[GenerateSWOptions](https://developer.chrome.com/docs/workbox/reference/workbox-build/#type-GenerateSWOptions)，默认配置如下
  - `skipWaiting:true`
  - `clientsClaim:true`
  - `cleanupOutdatedCaches:true`

## Events

为方便对`ServiceWorker`状态和更新机制进行定制，插件会触发`custom:sw`事件，事件监听示例如下

```javascript
window.addEventListener('custom:sw', function(event) {
  var eventName = event.detail.eventName;
  switch (eventName) {
    case 'ready':
      console.log(
        'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB',
      );
      break;
    case 'registered':
      console.log('Service worker has been registered.');
      break;
    case 'cached':
      console.log('Content has been cached for offline use.');
      break;
    case 'updatefound':
      console.log('New content is downloading.');
      break;
    case 'updated':
      console.log('New content is available; please refresh.');
      // 此处可添加PWA更新逻辑
      break;
    case 'offline':
      console.log(
        'No internet connection found. App is running in offline mode.',
      );
      break;
    case 'error':
      console.error(
        'Error during service worker registration:',
        event.detail.info,
      );
      break;
  }
});
```

## LICENSE

MIT
