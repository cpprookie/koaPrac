var axios = require('axios')
/**
 * routes test
 *  It's hard to test in this way after add koa-session
 */

async function  test () {
  // signup
  const signup = await axios.put('http://localhost:3001/signup',{
    userName: 'axiostest3',
    password:  '1234qwer',
    avatar: 'axiostest/avatar/01' 
  })
  const user = signup.data.user
  if (user) {
    console.log('signup success')
  } else return

  const user = {
    userName: 'axiostest3',
    password:  '1234qwer',
    userID: '59843a4b945c893cc8c9642a',
    avatar: 'axiostest/avatar/01' 
  }
  const userName = user.userName
  const password = `1234qwer`
  const userID = user.userID
  // signin after successful signup
  const signin = await axios.post('http://localhost:3001/signin', {userName, password})
  if (signin.data) {
    console.log(signin.data) 
  }  else return 

  // repeated login 
  const repeatedSignin = await axios.post('http://localhost:3001/signin', user)
  cosnole.log(repeatedSignin)

  // unexited login
  const unExitedSignin = await axios.post('http://localhost:3001/signin', {
    userName: 'anyone',
    password: '1234qwer'
  })
  console.log(unExitedSignin)

  // add user visit history 
  const historyTest = await axios.get(`http://localhost:3001/user/${userID}/post/597a9f849e82f15214714e12`)
  if(historyTest.data) {
    console.log('You can check history model')
  } else return

  // put an post  
  const putPost = await axios.put(`http://localhost:3001/user/${userID}/post/`, {
    title: `hi`,
    content: 'putpost test'
  })
  if (putPost.data.success === 'true') {
    console.log('put post success') 
  } else return 

  // post an post 
  const postPost = await axios.post(`http://localhost:3001/user/${userID}/post/`, {
    title: `haha`,
    content: 'postpost test'
  })
  if (postPost.data.success === 'true') {
    console.log('post post success') 
  } else return 

  // comment test 

  const putComment = await axios.put(`http://localhost:3001/post/597a9f849e82f15214714e12/comment`, {
    comment : {
      author: `${user.userID}`,
      content: 'comment test'
    }
  })
  if (putComment.data.success === 'true') {
    console.log('put post success') 
  } else return 

  // signout  test
  const signout = await axios.post(`http://localhost:3001/user/${user.uerID}/signout`)
  if (signout.data.success === 'true') {
    console.log('signout success') 
  } else return
}

test().catch(e => {console.log(e.message)})