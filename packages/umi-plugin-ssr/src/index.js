import { join, dirname } from 'path';
import rimraf from 'rimraf';
import composeKoa from 'koa-compose';
import c2k from 'koa-connect';
// import nodeExternals from 'webpack-node-externals';
import WriteFilePlugin from 'write-file-webpack-plugin';
import Service from 'umi-build-dev/lib/Service';
import buildDevOpts from 'umi/lib/buildDevOpts';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import Renderer from './Renderer';
import ssrFactory from './middlewares/ssr';

const pkg = require('umi/package.json');
const debug = require('debug')('umi-plugin-ssr');

let isUmiInitialized = false;
let renderer;

export async function render(ctx, next) {
  if (ctx.req.method !== 'GET') {
    ctx.throw(501, 'Not implemented');
  }

  if (!isUmiInitialized) {
    debug('umi start building on ssr...');

    process.env.UMI_DIR = dirname(require.resolve('umi/package.json'));
    process.env.UMI_VERSION = pkg.version;
    process.env.NODE_ENV = 'development';

    const service = new Service(buildDevOpts({}));
    service.run('dev', {
      ssr: true,
    });
    renderer = new Renderer(service);
    isUmiInitialized = true;
  }

  // ctx.body = await renderer.render(ctx);

  return composeKoa([c2k(ssrFactory(service, renderer))]);
}

export default function(api, options) {
  const {
    pkg,
    relativeToTmp,
    config: { publicPath },
    paths: { absOutputPath },
    onStart,
    onGenerateFiles,
    modifyAFWebpackOpts,
    chainWebpackConfig,
  } = api;

  const isDev = process.env.NODE_ENV === 'development';

  // clean /dist dir first
  rimraf.sync(absOutputPath);

  onGenerateFiles(() => {
    const { routes } = api;
    debug('routes: ', routes);
  });

  chainWebpackConfig(memo => {
    let progressBarOptions = {
      name: 'client',
    };
    let defineOptions = {
      'process.env.client': true,
      'process.env.server': false,
    };

    debug('is on server side?', !!memo.ssr);

    // convert client-side webpack config to server-side
    if (memo.ssr) {
      progressBarOptions = {
        name: 'server',
        color: 'orange',
      };
      defineOptions = {
        'process.env.client': false,
        'process.env.server': true,
      };

      // remove HMRClient in entry & relative plugin
      if (isDev && process.env.HMR !== 'none') {
        // memo.entries.delete('umi');
        // memo.entry

        // debug('routes: ', routes);
        memo.entry('umi').delete(webpackHotDevClientPath);
        memo.plugins.delete('hmr');
      }

      // don't need to copy public files
      memo.plugins.delete('copy');

      // set target & output format for node
      memo.target('node');
      memo.output.path(join(absOutputPath, 'umi-server'));
      memo.output.filename('[name].cmd.js');
      memo.output.libraryTarget('commonjs2');

      memo.plugin('write-file').use(WriteFilePlugin, []);

      // set externals
      // memo.externals([]);

      // target: 'node',
      // externals: [nodeExternals({
      //   whitelist: serlinaConfig.nodeExternalsWhitelist ? whitelist.concat(serlinaConfig.nodeExternalsWhitelist) : whitelist
      // })],
      // output: {
      //   filename: '[name].cmd.js',
      //   path: outputPath,
      //   publicPath,
      //   libraryTarget: 'commonjs2'
      // },

      // debug('entries: ', memo.entryPoints.values());
    }

    // modify some existed plugins
    memo
      .plugin('progress')
      .init((Plugin, args) => new Plugin({ ...args, ...progressBarOptions }));
    memo
      .plugin('define')
      .init((Plugin, args) => new Plugin({ ...args, ...defineOptions }));
    // debug(memo.entryPoints.values());

    // debug('plugins: ', Object.keys(memo.plugins.entries()));
    return memo;
  });

  modifyAFWebpackOpts((memo, opts) => {
    // debug('modify: ', routes);
    // debug('afwebpack:', memo);
    // debug('opts', opts)
    return memo;
  });
}
