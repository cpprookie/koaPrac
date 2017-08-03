var Koa = require('koa')
var config = require('./config')
var api = require('koa-router')()
var signin = require('./routers/signin')
var signup = require('./routers/signup')
var post = require('./routers/post')
var history = require('./routers/history')
var comment = require('./routers/comment')
var mongoose = require('mongoose')
var session = require('koa-session')

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb)

var app = new Koa()
app.keys = ['This is a secret', 'Another secret']

app.use(session(config.session,app))

// https://github.com/alexmingoia/koa-router/issues/125
app.use(signup)
app.use(signin)
app.use(post)
app.use(history)
app.use(comment)
app.use(api.routes())

app.listen(3001, () => {console.log('server is running!')})