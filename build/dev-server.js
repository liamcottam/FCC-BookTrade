require('dotenv').config();
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');
const connectHistory = require('connect-history-api-fallback')();

const config = require('./config');
const webpackConfig = require('./webpack.dev.conf');

const { proxyTable } = config.dev;
const compiler = webpack(webpackConfig);

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: '/',
  quiet: false,
  stats: {
    colors: true,
  },
});

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => { },
  heartbeat: 2000,
});

compiler.plugin('compilation', (compilation) => {
  compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
    hotMiddleware.publish({
      action: 'reload',
    });
    cb();
  });
});

const app = express();

// Proxy API Requests
Object.keys(proxyTable).forEach((context) => {
  let options = proxyTable[context];
  if (typeof options === 'string') {
    options = { target: options };
  }
  app.use(proxyMiddleware(options.filter || context, options));
});

app.use(connectHistory);
app.use(devMiddleware);
app.use(hotMiddleware);

let _resolve;
const readyPromise = new Promise((resolve) => {
  _resolve = resolve;
});

const port = process.env.PORT || 8080;
const uri = `http://localhost:${port}`;
console.log('> Starting dev server...');
devMiddleware.waitUntilValid(() => {
  console.log(`> Listening at ${uri}\n`);
  _resolve();
});

const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory);
app.use(staticPath, express.static('./static'));
const server = app.listen(port, '0.0.0.0');

module.exports = {
  ready: readyPromise,
  close() {
    server.close();
  },
};
