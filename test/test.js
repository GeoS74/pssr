const redis = require('redis');

async function delay(ms) {
  return new Promise(res => {
    setTimeout(_ => {
      res(1)
    }, ms)
  })
}

;(async () => {
  const client = await redis.createClient({url: `redis://default:mypassword@sgn74.ru:6378`,})
    .on('error', (error) => console.log('Redis Client Error', error))
    .connect();

  // console.log(await client.get('test'))
  for(let i = 0; i < 5000; i++) {
    await client.set(`tests${i}`, new Array(5000).fill('f').join(''), {
      EX: 3
    });

    console.log(i);

    // await delay(1000);
  }

  console.log('end');
})();