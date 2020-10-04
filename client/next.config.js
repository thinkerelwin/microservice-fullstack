module.exports = {
  webpackDevMiddleware: (config) => {
    config.watchOptions.poll = 500;
    return config;
  },
};
