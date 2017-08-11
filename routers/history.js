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
    return ctx.body = {
      success: true,
      message: 'get user history success',
      history: []
    }
  }
  // delete same article browser history
  if(all === 'false') {
    let arr = []
    arr.push(result[0])
    for (let i = 0, n = result.length; i < n; i++) {
      for(let j = 0; j < arr.length; j++) {
        if(result[i].post.title === arr[j].post.title) break
        else if (j === arr.length - 1) {
          arr.push(result[i])
          break
        }
      }
    }
    return ctx.body = {
        success: true,
        message: 'get user history success',
        history: arr
      }
  }
  ctx.body = {
    success: true,
    message: 'get user history success',
    history: result
  }
})

module.exports = router.routes()