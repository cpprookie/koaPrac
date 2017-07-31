var postModel = require('../models/post')
var History = require('../models/history')
var userModel = require('../models/user')
var parse = require('co-body')
var router = require('koa-router')()

// 未登陆用户访问某一文章
router.get('/post/:id', async ctx => {
  const id = ctx.params.id
  const opts = await postModel.find({_id: id})
                              .populate({path:'author',select:['userName','avatar']})
                              .catch(e => ctx.throw(500, e.message))
  const post = opts[0]
  if (!post) {
    ctx.throw(404, 'unexit post')
  }
  console.log('find post success')
  ctx.body = {
    success: true,
    message: 'find post success',
    post
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
    ctx.body = {
      success: true,
      message: `get posts on page ${ctx.query.page}`,
      totalPage,
      postList
    }
  }) 
  // 系统内用户访问某一文章
  .get('/user/:userID/post/:postID', async ctx => {
    const userID = ctx.params.userID
    const postID = ctx.params.postID
    let userOpts = await userModel.find({_id: userID}).catch(e => ctx.throw(500, e.message))
    let postOpts = await postModel.find({_id: postID}).catch(e => ctx.throw(500, e.message))
    if(userOpts[0] && postOpts[0]) {
      const history = new History ({
        post: postID,
        user: userID,
        lastViewTime: new Date()
      })
      await history.save().catch(e => ctx.throw(500, e.message))
      console.log('store user browsing history success')
      ctx.body={
        success: true,
        message: 'store user browsing history success'
      }
    }
  })
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
    // for (let key in post.author) [
    //   console.log(`${key}------>${post.author[key]}`)
    // ]
    // typeof(post.author) --> Object
    if(post.author.toString() !== userID) {
      ctx.throw(403, 'No authration')
    }

    const deletePost = await postModel.deleteOne({_id: postID}).catch(e => ctx.throw(500, 'internal server response'))
    console.log('delete post success')
    ctx.body = {
      success: true,
      message: 'delete post success'
    }
  })

  module.exports = router.routes()