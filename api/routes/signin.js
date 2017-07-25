var signinRouter = require('koa-router')()
var userModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')

signinRouter.post('/signin', async(ctx,next) => {
  const body = parse.json(ctx.request)
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
  UerModel.find({userName: userName})
    .then(user => {
      if (!user) {
        ctx.throw(404, 'unexited user')
      }
      if (user.password !== sha1(password)) {
        ctx.throw(403, 'incorrect password')
      }
      ctx.body = {
        success: true,
        message: 'login success',
        user: {
          userName: user.userName,
          userID: user._id
        }
      }
    })
})

module.exports = signinRouter