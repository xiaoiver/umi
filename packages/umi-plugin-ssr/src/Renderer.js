import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import Router from './Router';
const debug = require('debug')('umi-plugin-ssr');

export default class Renderer {
  constructor(service) {
    this.service = service;
    this.cache = {};
    this.router = null;
  }

  async render(ctx) {
    let path = ctx.path;
    if (path.startsWith('/')) {
      path = path.replace('/', '');
    }

    if (!this.cache[path]) {
      debug(`cache missed: ${path}`);
      try {
        const html = await this.renderRoute(path);
        this.cache[path] = html;
      } catch (e) {
        ctx.throw(500, 'Server side render error');
      }
    }

    return this.cache[path];
  }

  /**
   * render relative HTMLMarkup with input route path
   *
   * @param {string} routePath
   * @return {string} htmlMarkup
   */
  async renderRoute(routePath) {
    if (!this.router) {
      this.router = new Router(this.service.routes);
    }

    const page = await this.router.match(routePath);

    // TODO: Data PreFetching, eg. getInitialProps()
    // const page = await require(`./umi-server/${routePath}.cmd.js`);
    const pageContent = renderToString(createElement(page.default, {}));

    debug('ssr page content: ', pageContent);
    return 'xxxss';
  }
}
