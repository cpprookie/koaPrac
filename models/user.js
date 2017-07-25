const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  userName: {type: String, index:{unique: true}},
  password: String,
  avatar: String
})

module.exports = mongoose.model('userModel', userSchema)
