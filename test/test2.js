
;(async _ => {
  const sList = await getSitemap('https://sgn74.ru/sitemap/sitemap.xml');

  const sitemap = sList.match(/https.+xml/g)
  for(let i = 0; i < sitemap.length; i++) {

    const f = await getSitemap(sitemap[i]);

    const foo = f.match(/https[^<]*/g);
    const arr = [];
    for(let k = 0; k < foo.length; k++) {

      if(arr.length === 5) {
        await Promise.all(arr)
         .then(_ => console.log(`${new Date()} block: ${i+1}-${sitemap.length} ${k-4}-${k+1} in ${foo.length}`))
         .catch(err => `error: ${err.message}`)
        arr.length = 0;
      }

      arr.push(fetch(foo[k]));

      // await fetch(foo[k])
      //   .then(res => {
      //     if(res.ok){
      //       console.log(`${new Date()} block: ${i+1} ${k} in ${foo.length}`)
      //     }
      //   })
      //   .catch(err => {
      //     console.log(`error: ${err.message}`)
      //   });

      // await delay(300);
    }
  }
})();

function getSitemap(url) {
  return fetch(url)
  .then(async res => {
    if(res.ok) {
      const result = await res.text();
      return result;
    }
  })
}

async function delay(ms) {
  return new Promise(res => {
    setTimeout(_ => {
      res(1)
    }, ms)
  })
}