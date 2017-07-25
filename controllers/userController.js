var userModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')


// sign up
export async function signup (ctx) {
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
}

// signin
export async function signin (ctx) {
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
    .catch(e => {console.log(e.message)})
}