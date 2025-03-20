const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3008', 10);

// Add configuration for basePath
const basePath = process.env.NODE_ENV === 'production' ? '/prgminer' : '';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Log all incoming requests for debugging
      console.log(`Processing request: ${pathname}`);
      
      // Handle root requests in production - redirect to basePath
      if (process.env.NODE_ENV === 'production' && (pathname === '/' || pathname === '')) {
        console.log(`Redirecting from root to ${basePath}/`);
        res.writeHead(302, { Location: `${basePath}/` });
        res.end();
        return;
      }
      
      // Handle static files explicitly for the basePath
      if (basePath && pathname.startsWith(`${basePath}/_next`) || 
          basePath && pathname.startsWith(`${basePath}/images/`)) {
        console.log(`Serving static file: ${pathname}`);
      }
      
      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}${basePath}`);
    });
}); 