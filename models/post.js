const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
  title: String,
  author: {type: Schema.Types.ObjectId, ref:'userModel'},
  content: String,
  createTime: Date,
  lastEditTime: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('postModel', postSchema)
