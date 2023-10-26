import { createClient } from 'redis';
import config from '../config';
import { logger } from './logger';

export default createClient({
  url: `redis://default:${config.db.pass}@${config.db.host}:${config.db.port}`,
})
  .on('error', (error) => {
    logger.error('Redis Client Error', error);
  })
  .connect();
