export default {
  node: {
    env: process.env.NODE_ENV || 'dev',
  },
  server: {
    host: process.env.SERVER_HOST || 'localhost',
    port: process.env.SERVER_PORT || 3250,
  },
  react: {
    host: process.env.REACT_HOST,
    port: process.env.REACT_PORT,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 6379,
    pass: process.env.DB_PASS || 'mypassword',
  },
  key: {
    ttl: process.env.TTL_KEY || 60 * 60 * 24 * 7,
  },
  log: {
    file: 'app.log',
  },
};
