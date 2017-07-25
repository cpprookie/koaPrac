var signupRouter = require('koa-router')()
var userModel = require('../models/user')
var sha1 = require('sha1')
var parse = require('co-body')

signupRouter.put('/signup', async(ctx,next)=> {
  
})

module.exports = signupRouter