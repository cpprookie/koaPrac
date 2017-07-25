var Koa = require('koa')
var config = require('./config')
var router = require('./routes/signup')
var mongoose = require('mongoose')

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb)

var app = new Koa()

app.use(router.routes())

app.listen(3000, () => {console.log('server is running!')})