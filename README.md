# pssr

Микросервис рендеринга html кода с помощью Puppeteer и отдачи его обратно. Кэширует отрендеренные страницы, используя базу данных [Redis](https://redis.io).

### Docker

[Образ сервиса на hub.docker](https://hub.docker.com/repository/docker/geos74/pssr/general)

 #### environment

 `SERVER_PORT` = порт, на котором запускается сервер

 `REACT_HOST` = хост сервиса, для перенаправления запроса
 
 `REACT_PORT` = порт сервиса, для перенаправления запроса

 `DB_HOST` = хост базы данных

 `DB_PORT` = порт базы данных

 `DB_PASS` = пароль для подключения к базе данных