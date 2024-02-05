const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Read SSL certificate files
const privateKey = fs.readFileSync('./privkey.pem', 'utf8');
const certificate = fs.readFileSync('./fullchain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start the server on port 443 for HTTPS
const HTTPS_PORT = 443;
const HTTP_PORT = 80;

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`Server is running on port ${HTTPS_PORT}`);
});


// Redirect from HTTP to HTTPS
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();

}).listen(HTTP_PORT, () => {
    console.log(`Server is running on port ${HTTP_PORT}`);
});


