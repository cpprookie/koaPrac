var commentModel = require('../models/comment')
var mongoose = require('mongoose')
var postModel = require('../models/post')
var getCommentsCount = require('../middleware/getCommentsCount')
var parse = require('co-body')
var router = require('koa-router')()
var checkUserLogin = require('../middleware/checkUserLogin')

router.get('/post/:id/comment', async ctx => {
  /**
   * @todo how to  get comment Time like X mins ago
   */
  const id = ctx.params.id
  const currentPage = ctx.query.page || 0
  let pageOptions = {
    page: currentPage
  }
  let totalComments = await getCommentsCount(id)
  if (totalComments.length === 0) {
    return ctx.body = {
      success: true,
      message: `get comments for post: ${id} success`,
      comments: {
        totalComments: 0,
        totalPages: 0,
        currentPage: 0,
        commentList: []
      }
    }
  }
  let totalPages= Math.ceil(totalComments / 10)
  
  let commentList = await commentModel.aggregate([
    {$match: {post: mongoose.Types.ObjectId(id)}},
    {$lookup: {
      from: 'usermodels',
      localField: 'author',
      foreignField: '_id',
      as: 'author'}},
    {$project: {
      post: 1, 'author._id': 1, 'author.userName': 1, 'author.avatar': 1, 
      content: 1, timeago: {$subtract: [new Date, "$createTime"] 
    } 
    }},
    {$sort: {createTime: -1}},
    {$skip: pageOptions.page*20},
    {$limit: 20}
  ])
  // get date info like XXX-minutes ago
  commentList.map(item => {
    let timeago = item.timeago / 1000
    if (timeago < 60) return item.timeago = 'just now'
    timeago = timeago / 60
    if (timeago < 60) return item.timeago = Math.floor(timeago) +
       (Math.floor(timeago) === 1 ? ' minute ago' : ' minutes ago')
    timeago = timeago / 60
    if(timeago < 24) return item.timeago = Math.floor(timeago) +
       (Math.floor(timeago) === 1 ? ' hour ago' : ' hours ago')
    timeago = timeago / 24 
    if (timeago < 7) return item.timeago = Math.floor(timeago) +
       (Math.floor(timeago) === 1 ? ' day ago' : ' days ago')
    timeago = timeago / 7
    if (timeago < 4) return item.timeago = Math.floor(timeago) +
       (Math.floor(timeago) === 1 ? ' week ago' : ' weeks ago')
    timeago = timeago / 4
    if (timeago < 12) return item.timeago = Math.floor(timeago) +
       (Math.floor(timeago) === 1 ? ' month ago' : ' months ago')
    return item._doc.timeago = Math.floor(timeago) +
       (Math.floor(timeago) === 1 ? ' year ago' : ' years ago')
  })

  console.log(`get comments for post: ${id} success`)
    ctx.body = {
      success: true,
      message: `get comments for post: ${id} success`,
      comments: {
        totalComments,
        totalPages,
        currentPage,
        commentList
      }
    }
  })
  // create comment
  .put('/post/:id/comment', async ctx => {
    const post = ctx.params.id
    const body = await parse.json(ctx.request)
    let author = body.comment.author
    let content = body.comment.content
    /**
     * @todo check user in session or not
     */
    if (!content) {
      ctx.throw(400, 'invalid comment')
    } 
    if(!checkUserLogin.call(ctx, author)) {
      ctx.throw(400, 'illegal request, user is not logged in!')
    }
    let createTime = new Date
    let comment = new commentModel({
      post,
      author,
      content,
      createTime
    })
    const putComment = await comment.save().catch(e => ctx.throw(e.message))
    console.log('create comment success')
    ctx.body = {
      success: true,
      message: 'create comment success',
      comment: Object.assign(putComment._doc, {timeago: 'just now'})
    }
  })
  // remove comment
  .delete('/post/:postID/comment/:commentID', async ctx => {
    const post = ctx.params.postID
    const commentID = ctx.params.commentID
    const body = await parse.json(ctx.request)
    const user = body.user

    let opts = await commentModel.find({_id: commentID, post:post})
                              .populate('post','author')
                              .catch(e => ctx.throw(500, e.message))
    if (!opts[0]) {
      ctx.throw(404, 'non-exit comment')
    }
    if(!checkUserLogin.call(ctx, user)) {
      ctx.throw(400, 'illegal request, user is not logged in!')
    }
    console.log(opts[0])
    let comment = opts[0]
    // check user's authozation  post author || comment author
    if (user !== comment.author.toString() && user !== comment.post.author.toString()) {
      ctx.throw(400, 'no authority')
    }
    await commentModel.deleteOne({_id: commentID}).catch(e => ctx.throw(500, 'internal server response'))
    console.log('delete comment success')
    ctx.body = {
      success: true,
      message: 'delete comment success'
    }
  })

module.exports = router.routes()