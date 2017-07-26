var userModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')
var router = require('koa-router')()

// sign up
router.put('/signup', async (ctx,next) => {
  const body = await parse.json(ctx.request)
  const userName = body.userName
  let password = body.password
  const avatar = body.avatar
  const createTime = new Date()
  // check user info
  if (userName.length === 0) {
    ctx.throw(400, "userName required")
  }
  if (password.length < 8) {
    ctx.throw(400, 'password need to be more than characters')
  }
  if (!avatar) {
    ctx.throw(400, 'avatar required')
  }

  password = sha1(password)
  const user = new userModel({
    userName,
    password,
    avatar,
    createTime
  })
  
  await next()
  let createdUser = await user.save()
    .catch(e => {
      if (e.message.match('E11000 duplicate key')) {
        ctx.throw(403, 'Invalid userName')
      } else {
        ctx.throw(500, 'Internal server error')
      }
    })

  console.log('create user success!')
  ctx.body = {
    userID: createdUser._id,
    userName: createdUser.userName,
    avatar: createdUser.avatar
  }
})

module.exports = router.routes()