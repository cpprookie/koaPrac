var userModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')
var router = require('koa-router')()
var checkUserLogin = require('../middleware/checkUserLogin')

router.post('/user/:id/signout', async (ctx,next) => {
  // find if user exit
  if (!checkUserLogin.call(ctx, ctx.params.id)) {
    ctx.throw(404, 'unlogged user')
  }
  let index = ctx.session.logUserList.indexOf(ctx.params.id)
  ctx.session.logUserList.splice(index,1)
  console.log('signout success')
  ctx.body = {
    success: true,
    message: 'signout success',
  }
})

module.exports = router.routes()