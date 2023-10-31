import puppeteer, { Page } from 'puppeteer';
import {
  IncomingMessage, Server, ServerResponse, createServer,
} from 'http';
import config from './config';
import { logger } from './libs/logger';
import { _errorToJSON, _isNodeError } from './libs/errors';
import db from './libs/db';
import { delay } from './libs/delay';
import {JSDOM} from 'jsdom';

const browser = puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new',
});

const server: Server<typeof IncomingMessage, typeof ServerResponse> = createServer();

server.on('request', async (req: IncomingMessage, res: ServerResponse<IncomingMessage>): Promise<void> => {
  try {
    // const cache = await (await db).get(req.url || '');

    // if (cache) {
    //   res.setHeader('content-type', 'text/html; charset=utf-8');
    //   res.statusCode = 200;
    //   res.end(cache);
    //   return;
    // }

    let page: Page | null = await (await browser).newPage();

    await page.setCacheEnabled(false);

    await page.goto(`http://${config.react.host}:${config.react.port}${req.url}`);
    // await page.screenshot({path: path.join(__dirname, 'screenshot.png')});

    await page.waitForSelector('#root div');

    // await delay(+config.render.delay);

    const html = await page.content();

    const dom = new JSDOM(html);
    const root = dom.window.document.querySelector('#root')?.innerHTML;

    logger.info(dom.window.document.querySelector('meta[name="description"]')?.getAttribute('content'));
    if(root) {
      logger.info('root render');
    } else {
      logger.warn('root empty' + root);
    }
     

    await page.close();
    page = null;

    if (html.search('404 Страница не существует') !== -1) {
      res.statusCode = 404;
      res.end(html);
      return;
    }

    // (await db).set(req.url || '', html, {
    //   EX: +config.key.ttl,
    // });

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(html);
  } catch (error) {
    if (_isNodeError(error)) {
      logger.error(error.message);
      res.setHeader('content-type', 'application/json');
      res.statusCode = 500;
      res.end(_errorToJSON('internal server error'));
      process.exit(1); // restart container
    }
  }
});

server.listen(config.server.port, (): void => {
  logger.info(`server run at ${config.server.port} port`);
});
