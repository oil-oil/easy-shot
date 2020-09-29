// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env:'quick-note-90l6m'})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var limit = 20
    return await 
    db.collection(event.collection)
    .aggregate()
    .sort({_id:-1}) 
    .lookup(event.lookup)
    .match({[event.where]:_.in(event.match)})
    .skip(event.skip*limit)
    .limit(limit)
    .project(event.project)
    .end()
  } catch (e) {
    console.error(e)
  }
}