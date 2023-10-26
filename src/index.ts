import puppeteer from 'puppeteer';
import {
  IncomingMessage, Server, ServerResponse, createServer,
} from 'http';
import config from './config';
import { logger } from './libs/logger';
import { _errorToJSON, _isNodeError } from './libs/errors';
import db from './libs/db';

const server: Server<typeof IncomingMessage, typeof ServerResponse> = createServer();

server.on('request', (req: IncomingMessage, res: ServerResponse<IncomingMessage>): void => {
  try {
    (async () => {
      const cache = await (await db).get(req.url || '');

      if (cache) {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.statusCode = 200;
        res.end(cache);
        logger.info('отдаём из кэша');
        return;
      }

      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new',
      });
      const page = await browser.newPage();
      await page.goto(`http://${config.react.host}:${config.react.port}${req.url}`);
      // await page.screenshot({path: path.join(__dirname, 'screenshot.png')});
      const html = await page.content();

      (await db).set(req.url || '', html);

      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.statusCode = 200;
      res.end(html);
      await browser.close();
    })();
  } catch (error) {
    if (_isNodeError(error)) {
      logger.error(error.message);
      res.statusCode = 500;
      res.end(_errorToJSON('internal server error'));
    }
  }
});

server.listen(config.server.port, (): void => {
  logger.info(`server run at ${config.server.port} port`);
});
