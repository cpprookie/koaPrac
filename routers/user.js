var UserModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')
var router = require('koa-router')()
var fs = require('fs')
var path = require('path')
var checkUserLogin = require('../middleware/checkUserLogin')
var koaBody = require('koa-body')()

router.get('/user/:userID', async ctx => {
  const user = ctx.params.userID
  let result = await UserModel.find({_id: user}, {_id: 1, userName: 1, avatar: 1})
                            .catch(e => ctx.throw(500, e.message))
  if (!result) {
    ctx.throw(404, 'no related record')
  }
  ctx.body = {
    success: true,
    message: 'get user base info success',
    author: result
  }
})
 .post('/user/:id/avatar',koaBody, async ctx => {
    const _id = ctx.params.id
    if(!checkUserLogin.call(ctx, _id)) {
      return ctx.throw(400, 'you need login first')
    }  
    let result = await UserModel.find({_id})
                                .catch(e => ctx.throw(500, e.message))
    if (!result) {
      return ctx.throw(404, 'unexited user')
    }
    // console.log(ctx.request.body)
    const file = ctx.request.body.files.avatar
    // console.log(file)
    const reader = fs.createReadStream(file.path)
    // console.log(__dirname)
    let newFileName = result[0].userName +  file.name.match(/\.[0-9a-z]+$/i)[0]
    const stream = fs.createWriteStream(path.join(__dirname, '../public/images/',`${newFileName}`))
    reader.pipe(stream)
    console.log('uploading %s -> %s', file.name, stream.path)
    await UserModel.findByIdAndUpdate({_id},{avatar: `images/${newFileName}`})
    ctx.body = {
      success: 'true',
      message: 'update avatar success',
      avatar: `images/${newFileName}`
    }
 })
  .post('/user/:id/account', async ctx => {
    if(!checkUserLogin.call(ctx, _id)) {
      return ctx.throw(400, 'you need login first')
    }
    const _id = ctx.params.id
    const body = await parse.json(ctx.request)
    const password = body.password
    const newPassword = body.newPassword
    if(password === newPassword) {
      return ctx.throw(400, 'same password')
    }
    const user = await UserModel.find({_id,password: sha1(password)})
                                .catch(e => ctx.throw(500, e.message))
    if(!user) {
      ctx.throw(400, 'icorrect password')
    }
    await UserModel.findOneAndUpdate({_id},{password: sha1(newPassord)})
                   .catch(e => ctx.throw(500, 'e.message'))
    ctx.body = {
      success: true,
      message: 'update password success'
    }
  })
module.exports = router.routes()