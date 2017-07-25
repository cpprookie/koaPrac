const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
  title: String,
  author: String,
  content: String,
  createTime: Date,
  lastEditTime: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('postModel', postSchema)
