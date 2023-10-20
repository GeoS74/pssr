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
  log: {
    file: 'app.log',
  },
};
