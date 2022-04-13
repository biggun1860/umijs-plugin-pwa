import { readFileSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import writeJsonFile from 'write-json-file';
import loadJsonFile from 'load-json-file';
import shortid from 'shortid';
import { PwaManifest } from './typing';
import { GenerateSW } from 'workbox-webpack-plugin';
import chalk from 'chalk';
import { IApi } from '@umijs/types';

export default function(api: IApi) {
  const {
    paths: { absOutputPath, absSrcPath },
    userConfig: { pwa = {} },
  } = api;

  const manifest: PwaManifest = {};
  const options = pwa || {};
  const v: string = shortid.generate();

  api.describe({
    key: 'pwa',
    config: {
      default: {
        manifest,
        appStatusBar: '#fff',
        autoRefresh: false,
        showLog: true,
      },
      schema(joi) {
        return joi.object();
      },
    },
  });

  if (process.env.NODE_ENV === 'production') {
    api.addEntryCode(() => {
      const registerTpl = readFileSync(
        join(__dirname, 'registerServiceWorker.tpl'),
        'utf-8',
      );
      const registerConfig = {
        showLog: api.config.pwa.showLog,
        autoRefresh: api.config.pwa.autoRefresh,
        publicPath: api.config.publicPath,
      };
      return api.utils.Mustache.render(registerTpl, registerConfig);
    });

    api.onBuildComplete(async ({ err }) => {
      if (!err) {
        const src: string = options.src;
        let defaultManifest: any = {};

        if (src) {
          const manifestSrc = join(absSrcPath, src);
          const extension = src.substring(src.lastIndexOf('.') + 1);

          assert(
            extension === 'json',
            `The manifest file must be a ${chalk.underline.cyan(
              'json',
            )} file，Your current file type is ${chalk.underline.cyan(
              extension,
            )}.`,
          );

          defaultManifest = await loadJsonFile(manifestSrc);
        }

        const mergeManifest = Object.assign(
          {},
          defaultManifest,
          options.manifest,
        );

        await writeJsonFile(`${absOutputPath}/manifest.json`, mergeManifest);
      }
    });

    // TODO: more meta
    api.addHTMLMetas(() => {
      return [
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: api.config.pwa.appStatusBar,
        },
      ];
    });

    api.addHTMLLinks(() => {
      let href: string = `${api.config.publicPath}manifest.json`;
      if (options.hash) {
        href += '?v=' + v;
      }
      return [
        {
          rel: 'manifest',
          type: 'json',
          href,
        },
      ];
    });

    api.chainWebpack(config => {
      config.plugin('workbox').use(GenerateSW, [
        {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          ...options.workboxOptions,
          swDest: 'service-worker.js',
        },
      ]);
      return config;
    });
  }
}
