const PROXY_CONFIG = [
  {
    context: ['/jenkins'],
    target: 'http://localhost:8080',
    secure: false,
    logLevel: 'debug',
    changeOrigin: true,
    pathRewrite: {
      '^/jenkins': ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add Basic Auth header to all requests
      const auth = Buffer.from('admin:eyaelouni').toString('base64');
      proxyReq.setHeader('Authorization', 'Basic ' + auth);
      console.log('Proxying request to:', proxyReq.path);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log the response to debug
      console.log('Proxy response status:', proxyRes.statusCode);
      console.log('Proxy response Content-Type:', proxyRes.headers['content-type']);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
    }
  }
];

module.exports = PROXY_CONFIG;
