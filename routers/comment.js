var commentModel = require('../models/comment')
var mongoose = require('mongoose')
var postModel = require('../models/post')
var getCommentsCount = require('../middleware/getCommentsCount')
var parse = require('co-body')
var router = require('koa-router')()

router.get('/post/:id/comments', async ctx => {
  /**
   * @todo how to  get comment Time like X mins ago
   */
  const id = ctx.params.id
  const pageOptions = {
    page: ctx.query.page || 0
  }
  const totalCounts = await getCommentsCount(id)
  // let result = await commentModel.find({post: id})
  //                              .populate('author',['userName','avatar'])
  //                               .sort({createTime: -1})
  //                              .skip(pageOptions.page*20)
  //                              .limit(20)
  //                              .catch(e => ctx.throw(500, e.message))
  
const result = await commentModel.aggregate([
    {$match: {post: mongoose.Types.ObjectId(id)}},
    {$lookup: {
      from: 'usermodels',
      localField: 'author',
      foreignField: '_id',
      as: 'author'}},
    {$project: {
      post: 1, 'author._id': 1, 'author.userName': 1, 'author.avatar': 1, 
      content: 1, timeago: {$subtract: [new Date, new Date('createTime')]} 
    }},
    {$sort: {createTime: -1}},
    {$skip: pageOptions.page*20},
    {$limit: 20}
  ])
  console.log(`get comments for post: ${id} success`)
    ctx.body = {
      success: true,
      message: `get comments for post: ${id} success`,
      comments: Object.assign({}, result, {totalCounts})
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
    let createTime = new Date
    let comment = new commentModel({
      post,
      author,
      content,
      createTime
    })
    const result = await comment.save()
                                .catch(e => ctx.throw(e.message))
    console.log('create comment success')
    ctx.body = {
      success: true,
      message: 'create comment success',
      comment: result 
    }
  })
  // remove comment
  .delete('/post/:postID/comment/:commentID', async ctx => {
    const post = ctx.params.postID
    const commentID = ctx.params.commentID
    const body = await parse.json(ctx.request)
    const author = body.author

    let opts = await commentModel.find({_id: commentID, post:post})
                              .populate('post','author')
                              .catch(e => ctx.throw(500, e.message))
    if (!opts[0]) {
      ctx.throw(404, 'non-exit comment')
    }
    console.log(opts[0])
    let comment = opts[0]
    // check author's authozation  post author || comment author
    if (author !== comment.author.toString() && author !== comment.post.author.toString()) {
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