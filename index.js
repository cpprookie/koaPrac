var Koa = require('koa')
var app = new Koa()
var router = require('./routes/router')

app.use(router.routes())

app.listen(3000, () => {console.log('server is running!')})