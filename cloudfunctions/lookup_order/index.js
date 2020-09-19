// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env:'quick-note-90l6m'})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const match = event.match
  try {
    var limit = 20
    return await 
    db.collection(event.collection)
    .aggregate()
    .sort({date:-1}) 
    .lookup(event.lookup)
    .lookup(event.lookup2)
    .match(_.and([
      {match},
      event.match2
    ]))
    .skip(event.skip*limit)
    .limit(limit)
    .project(event.project)
    .end()
  } catch (e) {
    console.error(e)
  }
}