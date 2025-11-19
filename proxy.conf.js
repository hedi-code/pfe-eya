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
  },
  {
    context: ['/api/chatbot'],
    target: 'https://eyaelouni.app.n8n.cloud',
    secure: true,
    logLevel: 'debug',
    changeOrigin: true,
    pathRewrite: {
      '^/api/chatbot': '/webhook-test/brain-chat'
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Proxying chatbot request to:', proxyReq.path);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('Chatbot proxy response status:', proxyRes.statusCode);
      console.log('Chatbot proxy response headers:', proxyRes.headers);
    },
    onError: (err, req, res) => {
      console.error('Chatbot proxy error:', err);
    }
  }
];

module.exports = PROXY_CONFIG;
