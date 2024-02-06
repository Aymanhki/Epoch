const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();

const keyPath = './privkey.pem';
const certPath = './fullchain.pem';
const PORT_HTTPS = 443;
const PORT_HTTP = 80;


const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.use((req, res, next) => {
  if (!req.secure) {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

https.createServer(options, app).listen(PORT_HTTPS, () => {
  console.log(`Server is running on port ${PORT_HTTPS}`);
});


http.createServer((req, res) => {
  res.writeHead(301, { 'Location': `https://${req.headers['host']}${req.url}` });
  res.end();
}).listen(PORT_HTTP);
