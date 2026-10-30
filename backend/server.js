require('dotenv').config();
const dns = require('dns');
const env = require('./src/config/env.js');

// Optional DNS override (fixes mongodb+srv lookup failures on some networks).
if (env.dnsServers.length) dns.setServers(env.dnsServers);

const app = require('./src/app.js');
const connectDB = require('./src/db/db.js');

const start = async () => {
  await connectDB(); // do not accept traffic until the database is ready
  const server = app.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
