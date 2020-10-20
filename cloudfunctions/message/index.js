const cloud = require('wx-server-sdk')
cloud.init({env:'quick-note-90l6m'})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  const type = event.type
  var limit  = 20
  switch(type){
    case 'get_all_data': return await
    db.collection(event.collection)
    .aggregate()
    .sort({_id:-1}) 
    .lookup(event.lookup)
    .lookup(event.lookup2)
    .match(event.match)
    .skip(event.skip*limit)
    .limit(limit)
    .project(event.project)
    .end()
  }
  
 
}