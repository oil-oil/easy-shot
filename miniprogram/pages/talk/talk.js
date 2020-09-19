// miniprogram/pages/talk/talk.js
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    text:'',
    text_line:0,
    count:-1,
    skip:0,
    nomore:false,
    receiver:'',
    sender:'',
    text_array:[],
    last_view:'',
    me_room_id:'',
    receiver_room_id:''
  },
  onLoad(e){
    this.setData({receiver:JSON.parse(e.user)})
    this.get_talk_room()
    this.get_talk()
    this.onwatch()
    wx.setNavigationBarTitle({
      title: this.data.receiver.name
    })
    this.setData({sender:getApp().globalData.user})
  },
  get_talk_room(){
    db.collection('talk_room').where({_openid:getApp().globalData.user._openid})
    .get()
    .then(res=>{
      var date = new Date()
      if(!res.data.length){
        db.collection('talk_room').add({
          data:{
            _openid2:this.data.receiver._openid,
            last_message:'',
            date:''+ date.getTime() +'',
            status:1
          }
        }).then(res=>{
          this.setData({me_room_id:res._id})
        })
      }
      else{
        this.setData({me_room_id:res.data[0]._id})
        db.collection('talk_room').doc(res.data[0]._id).update({
          data:{
            status:1
          }
        })
      }
    })
    db.collection('talk_room').where({_openid:this.data.receiver._openid})
    .get()
    .then(res=>{
      var date = new Date()
      if(!res.data.length){
        db.collection('talk_room').add({
          data:{
            _openid:this.data.receiver._openid,
            _openid2:getApp().globalData.user._openid,
            last_message:'',
            date:''+ date.getTime() +'',
            status:1
          }
        }).then(res=>{
          this.setData({receiver_room_id:res._id})
        })
      }
      else{
        this.setData({receiver_room_id:res.data[0]._id})
      }
    })
  },
  get_talk(){
    console.log(this.data.skip)
    const limit = 20
    db.collection('talk')
    .aggregate()
    .sort({_id:-1})
    .limit(limit)
    .skip(this.data.skip*limit)
    .match(_.and([
      {
        receiver:_.or(this.data.receiver._openid,getApp().globalData.user._openid)
      },
      {
        _openid:_.or(this.data.receiver._openid,getApp().globalData.user._openid)
      }
    ])
    )
    .end()
    .then(res=>{
      console.log(res)
      if(!res.list.length){
        this.data.nomore = true
        return
      }
      var temp = this.data.text_array
      for(let i in res.list){
        if(res.list[i].receiver == getApp().globalData.user._openid){
          res.list[i].user = 'other'
        }
        else{
          res.list[i].user = 'me'
        }
        temp.unshift(res.list[i])
      }
      this.setData({text_array:temp,last_view:'last_view'})
    })
  },
  load_more(){
    if(!this.data.nomore){
      ++this.data.skip
    }
    this.get_talk()
  },
  onwatch(){
    const watcher = db.collection('talk')
    .orderBy('_id', 'desc')
    .limit(1)
    .where(_.and([
      {
        receiver:_.or(this.data.receiver._openid,getApp().globalData.user._openid)
      },
      {
        _openid:_.or(this.data.receiver._openid,getApp().globalData.user._openid)
      }
    ])
    )
    .watch({
      onChange: snapshot=> {
        ++this.data.count
        if(this.data.count === 0 ){
          return
        }
        var temp = this.data.text_array
        if(snapshot.docs.length){
          if(snapshot.docs[0].receiver == getApp().globalData.user._openid){
            snapshot.docs[0].user = 'other'
          }
          else if(snapshot.docs[0].receiver == this.data.receiver._openid){
            snapshot.docs[0].user = 'me'
          }
          else{
            return
          }
        temp.push(snapshot.docs[0])
        this.setData({text_array:temp})
        this.setData({last_view:'last_view'})
        }
        
      },
      onError: err=> {
        console.error('the watch closed because of error', err)
      }
    }) 
  },
  text_input(e){
    this.setData({text:e.detail.value})
  },
  line_change(e){
    this.setData({text_line:e.detail.lineCount})
  },
  send(){
    if(!this.data.text){
      return
    }
    var date = new Date()
    db.collection('talk').add({
      data:{
        _id:''+ date.getTime(),
        receiver:this.data.receiver._openid,
        text:this.data.text
      }
    }).then(res=>{
      this.setData({text:''})
    })
    var date = new Date()
    db.collection('talk_room')
    .where(_.or([
      {_id:this.data.me_room_id},
      {_id:this.data.receiver_room_id}
    ]))
    .update({
      data:{
        date:''+ date.getTime() +'',
        last_message:this.data.text
      }
    })
    db.collection('talk_room').doc(this.data.receiver_room_id)
    .update({
      data:{
        status:0
      }
    })
  },
  onUnload(){
    db.collection('talk_room').doc(this.data.me_room_id).update({
      data:{
        status:1
      }
    })
  }
})