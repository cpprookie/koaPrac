var History = require('../models/history')
var router = require('koa-router')()

router.get('/user/:userID/history', async ctx => {
  const user = ctx.params.userID
  const all = ctx.query.all
  let result = await History.find({user: user})
                            .populate('post','title')
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

module.exports = router.routes()