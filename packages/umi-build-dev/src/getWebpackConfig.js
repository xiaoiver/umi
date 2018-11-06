import getConfig from 'af-webpack/getConfig';
import assert from 'assert';

export default function(service, options = {}) {
  const { config } = service;

  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: service.cwd,
    },
  });

  assert(
    !('chainConfig' in afWebpackOpts),
    `chainConfig should not supplied in modifyAFWebpackOpts`,
  );
  afWebpackOpts.chainConfig = webpackConfig => {
    // add ssr flag on webpackChain config
    webpackConfig.ssr = options.ssr;

    service.applyPlugins('chainWebpackConfig', {
      args: webpackConfig,
    });
    if (config.chainWebpack) {
      config.chainWebpack(webpackConfig, {
        webpack: require('af-webpack/webpack'),
      });
    }
  };

  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: getConfig(afWebpackOpts),
  });
}
