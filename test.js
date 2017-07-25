const fs = require('fs')

const path = require('path')

const http = require('http')

const resource = path.join(__dirname, '../practice/htmlprac/ffPlayer/index.html')


var server = http.createServer(function(req,res) {
  console.log (req.url)

    fs.readFile(resource, (err, data) => {
      if (err)  throw err
      res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length})
      res.write(data)
      res.end()
    })
})


server.listen('3000')
