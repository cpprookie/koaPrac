var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/formalblog')

var db =  mongoose.connection

db.on('error', console.error.bind(console, 'connection error'))

db.once('open', function(){
  var KittySchema = mongoose.Schema({
    name: String
  })

  KittySchema.methods.speak = function () {
    console.log(this.name ? `Meow name is ${this.name}` : "I don't have a name")
  }

  var Kitten = mongoose.model('Kitten', KittySchema)
  var silence = new Kitten({name: 'test'})
  silence.save(function(err, silence) {
    if(err) return console.log(err)
    silence.speak()
  })
  Kitten.find((err,kittens)=>{
    if (err) return console.log(err)
    console.log(kittens)
  })
})