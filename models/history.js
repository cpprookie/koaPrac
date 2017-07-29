const mongoose = require('mongoose')

const Schema = mongoose.Schema

const historySchema = new Schema({
  post: {type: Schema.Types.ObjectId, ref:'postModel'},
  user:{type: Schema.Types.ObjectId, ref:'userModel'},
  lastViewTime: Date
})

module.exports = mongoose.model('History', historySchema)
