function checkUserLogin (_id) {
  this.session.logUserList = this.session.logUserList || []
  const logUserList =  this.session.logUserList
  return logUserList.indexOf(_id) === -1 ? false : true
}

module.exports = checkUserLogin