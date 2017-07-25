var router = require('koa-router')()
var userModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')

router.put('/signup', async(ctx,next)=> {

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

  let createdUser = await user.save().catch(err => {ctx.throw(500, 'server error')})

  // await userModel.populate(function(err, result) {
  //   if (err) console.log(err)
  //   createUser = result
  // })

  console.log('create user success!')
  ctx.body = {
    userID: createdUser._id,
    userName: createdUser.userName,
    avatar: createdUser.avatar
  }
})

module.exports = router