const cloud = require('wx-server-sdk')
cloud.init({env:'quick-note-90l6m'})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
exports.main = async (event, context) => {
  const type = event.type
  const limit  = 20
  const match = event.match
  switch(type){
    case 'get_all_data': return await
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

    case 'get_detail': return await
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
  }
  
  
 
}