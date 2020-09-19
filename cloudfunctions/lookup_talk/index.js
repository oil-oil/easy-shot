// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env:'quick-note-90l6m'})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var limit = 20
    return await 
    db.collection(event.collection)
    .aggregate()
    .sort({date:-1}) 
    .lookup(event.lookup)
    .lookup(event.lookup2)
    .match(event.match)
    .skip(event.skip*limit)
    .limit(limit)
    .project(event.project)
    .end()
  } catch (e) {
    console.error(e)
  }
}