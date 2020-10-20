const cloud = require('wx-server-sdk')
cloud.init({env:'quick-note-90l6m'})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
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
    .skip(event.skip*limit)
    .limit(limit)
    .project({
      'comment._id':1,
      'text':1,
      'date':1,
      'user.name':1,
      'user._openid':1,
      'user.avatar':1,
      'like_status':$.in([event._openid,'$like']),
      'like_length':$.size('$like'),
      title:1,
      type:1,
      tag:1,
      'img':1,
    })
    .end()

    case 'get_post_data': return await
    db.collection(event.collection)
    .aggregate()
    .sort({_id:-1}) 
    .lookup(event.lookup)
    .lookup(event.lookup2)
    .match(event.match)
    .skip(event.skip*limit)
    .limit(limit)
    .project({
      'comment._id':1,
      'text':1,
      'date':1,
      'user.name':1,
      'user._openid':1,
      'user.avatar':1,
      'like_length':$.size('$like'),
      title:1,
      type:1,
      tag:1,
      'img':1,
    })
    .end()

    case 'get_follow_data' : return await
    db.collection(event.collection)
    .aggregate()
    .sort({date:-1}) 
    .lookup(event.lookup)
    .lookup(event.lookup2)
    .match({'_openid':_.in(event.match)})
    .skip(event.skip*limit)
    .limit(limit)
    .project({
      'comment._id':1,
      'text':1,
      'date':1,
      'user.name':1,
      'user._openid':1,
      'user.avatar':1,
      'like_status':$.in([event._openid,'$like']),
      'like_length':$.size('$like'),
      title:1,
      type:1,
      tag:1,
      'img':1,
    })
    .end()

    case 'get_detail': return await
    db.collection(event.collection)
    .aggregate()
    .sort({_id:-1}) 
    .lookup(event.lookup)
    .match(event.match)
    .skip(event.skip*limit)
    .limit(limit)
    .project({
      'text':1,
      'user.name':1,
      'user.avatar':1,
      'user._openid':1,
      'date':1,
      'img':1,
      title:1,
      type:1,
      tag:1,
      'like_status':$.in([event._openid,'$like']),
      'like_length':$.size('$like')
    })
    .end()

    case 'get_comment': return await
    db.collection(event.collection)
    .aggregate()
    .sort({_id:-1}) 
    .lookup(event.lookup)
    .match(event.match)
    .skip(event.skip*limit)
    .limit(limit)
    .project(event.project)
    .end()
  }
  
  
 
}