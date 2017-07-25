const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentSchema = new Schema({
  post: String,
  author: String,
  content: String
})

module.exports = mongoose.model('commentModel', commentSchema)
