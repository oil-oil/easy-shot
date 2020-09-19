// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'quick-note-90l6m'
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return event.userInfo
  
}