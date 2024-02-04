const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();

// Serve static files from the 'build' directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// PostgreSQL database connection configuration
const pool = new Pool({
  user: 'epoch_admin',
  host: '35.203.60.186',
  database: 'epoch_db',
  password: 'Epoch@3',
  port: 5432,
});

// Function to fetch SSL certificate files from the database
async function fetchSSLCertificates() {
  try {
    const client = await pool.connect();
    const queryResult = await client.query(
      "SELECT credential_type, credential_value FROM secret_files WHERE credential_type IN ('private_key', 'full_chain')"
    );

    const credentials = {};
    for (const row of queryResult.rows) {
      credentials[row.credential_type] = row.credential_value;
    }

    client.release();
    return credentials;
  } catch (error) {
    console.error('Error fetching SSL certificates from the database:', error);
    throw error;
  }
}

// Create an HTTPS server
async function startServer() {
  try {
    const { private_key, full_chain } = await fetchSSLCertificates();
    const credentials = { key: private_key, cert: full_chain };

    const httpsServer = https.createServer(credentials, app);

    // Start the server on port 443 for HTTPS
    const HTTPS_PORT = 443;
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`Server is running on port ${HTTPS_PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
