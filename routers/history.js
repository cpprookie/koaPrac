var History = require('../models/history')
var router = require('koa-router')()

router.get('/user/:userID/history', async ctx => {
  const user = ctx.params.userID
  console.log(ctx.query)
  const all = ctx.query.all
  let result = await History.find({user: user})
                            .sort({lastViewTime: -1})
                            .catch(e => ctx.throw(e.message))
  if (!result) {
    ctx.throw(404, 'no related record')
  }
  if(all === 'false' && result.length > 6) {
    ctx.body = {
      sucess: true,
      message: 'get user history success',
      history: result.slice(0,4)
    }
  }
  ctx.body = {
    sucess: true,
    message: 'get user history success',
    history: result
  }
})

router.get('/history', async ctx => {
  ctx.body={
    message: 'hello history'
  }
})

module.exports = router.routes()