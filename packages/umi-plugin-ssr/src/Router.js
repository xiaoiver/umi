import pathToRegexp from 'path-to-regexp';
const debug = require('debug')('umi-plugin-ssr');

export default class Router {
  constructor(routes) {
    this.routes = this.format(routes);
  }

  format(routes) {
    // = pathToRegexp()
    debug('formatted routes: ', routes);
    return routes;
  }

  async match(path) {}
}
