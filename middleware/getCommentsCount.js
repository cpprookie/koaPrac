var commentModel = require('../models/comment')

async function getCommentsCount (id) {
  var opts = await commentModel.find({post: id})
  return opts.length ? opts.length : 0
}

module.exports = getCommentsCount