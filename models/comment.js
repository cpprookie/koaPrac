const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentSchema = new Schema({
  post: {type: Schema.Types.ObjectId, ref:'postModel'},
  author:{type: Schema.Types.ObjectId, ref:'userModel'},
  content: String,
  createTime: Date
})

 
module.exports = mongoose.model('commentModel', commentSchema)