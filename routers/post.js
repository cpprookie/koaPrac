var postModel = require('../models/post')
var History = require('../models/history')
var userModel = require('../models/user')
var commentModel = require('../models/comment')
var getCommentsCount = require('../middleware/getCommentsCount')
var parse = require('co-body')
var router = require('koa-router')()



// 访问文章
router.get('/post/:id', async ctx => {
  const id = ctx.params.id
  const opts = await postModel.find({_id: id})
                              .populate({path:'author',select:['userName','avatar']})
                              .catch(e => ctx.throw(500, e.message))
  let post = opts[0]
  if (!post) {
    ctx.throw(404, 'unexit post')
  }
  const comments = await getCommentsCount(id)
  console.log('find post success')

  // add comment to query result 
  const result = Object.assign({}, post._doc, {comments})
  /**
   * @todo 此处应在session里查询用户是否登陆
   */
  if (ctx.params.userID) {
    const userOpts = await userModel.find({_id: ctx.params.userID})
                                    .catch(e => ctx.throw(500, e.message))
    if(userOpts[0]) {
      const history = new History ({
        post: postID,
        user: userID,
        lastViewTime: new Date()
      })
      await history.save().catch(e => ctx.throw(500, e.message))
    }
  }
  
  ctx.body = {
    success: true,
    message: 'find post success',
    post: result
  }
})
  .get('/posts', async ctx => {
    const pageOptions = {
      page: ctx.query.page || 0,
      limit: 20
    }
    const totalCount = await postModel.count({}).catch(e => ctx.throw(500, e.message))
    const totalPage = Math.ceil(totalCount / 20)
    const postList = await postModel.find()
                                    .sort({lastEditTime: -1})
                                    .skip(pageOptions.page*20)
                                    .limit(20)
                                    .populate('author', 'userName')
                                    .catch(e => ctx.throw(500, e.message))
    // https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
    const results = await Promise.all(postList.map(async item => {
      let comments = await getCommentsCount(item._id) 
      return Object.assign({}, item._doc, {comments})
    }))

    console.log(results)
    ctx.body = {
      success: true,
      message: `get posts on page ${ctx.query.page}`,
      totalPage,
      postList: results
    }
  }) 
  // 发表文章
  .put('/user/:userID/post', async ctx => {
    const body = await parse.json(ctx.request)
    const title = body.post.title
    const content = body.post.content
    const userID= ctx.params.userID
    if (!title) {
      ctx.throw(400, 'empty title')
    }
    if (!content) {
      ctx.throw(400, 'empty content')
    }
    /**
     * @todo check user in session or not!
     */
    let opts = await postModel.find({author: userID ,title: title}).catch(e=> ctx.throw(500, e.message))
    if (opts.length) {
      ctx.throw(400, 'different articles with same title and same author ')
    }
    const author = userID
    const createTime = lastEditTime = new Date
    const newPost = new postModel({
      title,
      author,
      content,
      createTime,
      lastEditTime
    })
    const createPost = await newPost.save().catch(e=> ctx.throw(500, 'internal server response'))
    console.log('create post success')
    ctx.body = {
      success: true,
      message: 'create post success',
      createPost
    }
  })
  .post('/user/:userID/post/:postID', async ctx => {
    const userID = ctx.params.userID
    const postID = ctx.params.postID
    const opts = await postModel.find({_id: postID}).catch(e => ctx.throw(500, 'internal server response'))
    const post = opts[0]
    if (!post) {
      ctx.throw(400, 'non-exit post')
    }
    if(post.author.toString() !== userID) {
      ctx.throw(403, 'No authration')
    }
    
    const body = await parse.json(ctx.request)
    const editPost = body.post 
    if (!editPost.title || !editPost.content) {
      ctx.throw(400, 'empty title or content')
    }
    const result = await postModel
                         .findOneAndUpdate({_id: postID},
                           {$set: {title: editPost.title, content: editPost.content, lastEditTime: new Date}}, {new: true})
                         .exec()
                         .catch(e => {ctx.throw(500, e.message)})
    console.log('edit post success')
    console.log(result)
    ctx.body = {
      success: true,
      message: "edit post success",
      result
    }
  })
  .delete('/user/:userID/post/:postID', async ctx => {
    const userID = ctx.params.userID
    const postID = ctx.params.postID
    const opts = await postModel.find({_id: postID}).catch(e => ctx.throw(500, 'internal server response'))
    const post = opts[0]
    if (!post) {
      ctx.throw(400, 'non-exit post')
    }
    if(post.author.toString() !== userID) {
      ctx.throw(403, 'No authration')
    }

    await postModel.deleteOne({_id: postID})
                   .catch(e => ctx.throw(500, 'internal server response'))
    await commentModel.deleteMany({post: postID})
                      .catch(e => ctx.throw(500, 'internal server response'))
    console.log('delete post success')
    ctx.body = {
      success: true,
      message: 'delete post success'
    }
  })

  module.exports = router.routes()