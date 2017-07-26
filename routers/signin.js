var userModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')
var router = require('koa-router')()

router.post('/signin', async (ctx,next) => {
  const body = await parse.json(ctx.request)
  const userName = body.userName
  let   password = body.password
  // check request data format
  if(!userName) {
    ctx.throw(400, 'required userName')
  }
  if(password.length < 8) {
    ctx.throw(400, 'wrong format password')
  }

  // find if user exit
  const opts = await userModel.find({userName: userName}).catch(e => {console.log(e.message)})
  const user = opts[0]
  if (!user) {
    ctx.throw(404, 'unexited user')
  }
  if (user.password !== sha1(password)) {
    ctx.throw(403, 'incorrect password')
  }
  console.log('signin success')
  ctx.body = {
    success: true,
    message: 'signin success',
    user: {
      userName: user.userName,
      userID: user.password,
      avatar: user.avatar
    }
  }
})

module.exports = router.routes()