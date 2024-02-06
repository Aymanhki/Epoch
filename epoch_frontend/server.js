const express = require('express');
const path = require('path');

const app = express();

// Middleware to redirect HTTPS to HTTP
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === 'https') {
    // Redirect to HTTP
    const httpUrl = `http://${req.hostname}${req.url}`;
    return res.redirect(httpUrl);
  }
  next();
});

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server on port 80
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
