import puppeteer, { Page } from 'puppeteer';
import {
  IncomingMessage, Server, ServerResponse, createServer,
} from 'http';
import config from './config';
import { logger } from './libs/logger';
import { _errorToJSON, _isNodeError } from './libs/errors';
// import path from 'path';
import db from './libs/db';

const browser = puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: 'new',
});

const server: Server<typeof IncomingMessage, typeof ServerResponse> = createServer();

server.on('request', async (req: IncomingMessage, res: ServerResponse<IncomingMessage>): Promise<void> => {
  const targetURL = `http://${config.react.host}:${config.react.port}${req.url}`;
  try {

    console.log('targetURL ', targetURL);

    if (!config.cache.bypass) {
      console.log('cache on');
      const cache = await (await db).get(req.url || '');

      if (cache) {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.statusCode = 200;
        res.end(cache);
        return;
      }
    } else {
      console.log('cache off');
    }

    let page: Page | null = await (await browser).newPage();

    // Вставляем полифилы для URL.parse и Promise.withResolvers
    await page.evaluateOnNewDocument(() => {
      if (!('parse' in URL)) {
        (URL as any).parse = function (url: string) {
          try {
            // Если URL валидный - парсим стандартным способом
            const parsed = new URL(url);
            return {
              protocol: parsed.protocol,
              hostname: parsed.hostname,
              pathname: parsed.pathname,
              query: parsed.searchParams,
              href: parsed.href,
              origin: parsed.origin,
              port: parsed.port,
              hash: parsed.hash
            };
          } catch (e) {
            // Фоллбек для невалидных URL
            //Может быть такая ошибка TypeError: Failed to construct 'URL': Invalid URL
            const dummyLink = document.createElement('a');
            dummyLink.href = url;

            return {
              protocol: dummyLink.protocol,
              hostname: dummyLink.hostname,
              pathname: dummyLink.pathname,
              query: new URLSearchParams(dummyLink.search),
              href: dummyLink.href,
              origin: dummyLink.protocol + '//' + dummyLink.host,
              port: dummyLink.port,
              hash: dummyLink.hash
            };
          }
        };
      }

      // Вставляем полифил для Promise.withResolvers
      if (!('withResolvers' in Promise)) {
        (Promise as any).withResolvers = function () {
          let resolve;
          let reject;
          const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
          });
          return { promise, resolve, reject };
        };
      }
    });

    await page.setCacheEnabled(false);

    await page.goto(`http://${config.react.host}:${config.react.port}${req.url}`);

    await page.waitForSelector(config.react.rootSelector);
    // await page.screenshot({ path: path.join(__dirname, 'screenshot.png') });

    const html = await page.content();

    await page.close();
    page = null;

    if (html.search('404 Страница не существует') !== -1) {
      res.statusCode = 404;
      res.end(html);
      return;
    }

    if (!config.cache.bypass) {
      (await db).set(req.url || '', html, {
        EX: +config.key.ttl,
      });
    }

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.statusCode = 200;
    res.end(html);
  } catch (error) {
    if (_isNodeError(error)) {
      logger.error(`${error.message} ${targetURL}`);
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
