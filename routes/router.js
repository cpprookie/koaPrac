var router = require('koa-router') ()

router.get('/', (ctx) => {
  ctx.body = 'hello index!'
})

router.get('/test', (ctx) => {
  ctx.body = 'hello test!'
})

module.exports = router