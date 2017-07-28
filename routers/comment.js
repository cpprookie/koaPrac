var commentModel = require('../models/comment')
var postModel = require('../models/post')
var parse = require('co-body')
var router = require('koa-router')()

router.get('/post/:id/comments', async ctx => {
  const id = ctx.params.id
  let result = await commentModel.find({post: id})
                               .populate('author','userName')
                               .sort({createTime: -1})
                               .catch(e => ctx.throw(500, e.message))
  console.log(`get comments for post: ${id} success`)
  ctx.body = {
    success: true,
    message: `get comments for post: ${id} success`,
    comments: result
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