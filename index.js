var Koa = require('koa')
var config = require('./config')
var api = require('koa-router')()
var signin = require('./routers/signin')
var signup = require('./routers/signup')
var post = require('./routers/post')
var history = require('./routers/history')
var comment = require('./routers/comment')
var mongoose = require('mongoose')

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb)

var app = new Koa()


// https://github.com/alexmingoia/koa-router/issues/125
app.use(signup)
app.use(signin)
app.use(post)
app.use(history)
app.use(comment)
app.use(api.routes())

app.listen(3000, () => {console.log('server is running!')})