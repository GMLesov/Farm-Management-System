const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Remove problematic headers that might be too large
        proxyReq.removeHeader('referer');
        proxyReq.removeHeader('origin');
        proxyReq.setHeader('origin', 'http://localhost:3000');
      },
      headers: {
        'Connection': 'keep-alive'
      }
    })
  );
};
