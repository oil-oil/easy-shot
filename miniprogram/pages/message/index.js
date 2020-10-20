// miniprogram/pages/message/index.js
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    unread:{
      notice:0,
      comment:0,
      like:0
    },
    talk_room:{
      array:[],
      skip:0
    },
    refreshing:false,
    loading:false,
  },
  watch_talk_room(){
    // 实时获取聊天室数据更新
    const talk_watcher = db.collection('talk_room')
    .where(
      {
        _openid:getApp().globalData.user._openid
      }
    )
    .limit(1)
    .orderBy('date','desc')
    .watch({
      onChange:snapshot=> {
        if(snapshot.docs.length){
          var temp = this.data.talk_room.array
          for(let i in temp){
            if(temp[i]._id == snapshot.docs[0]._id){
              temp[i].last_message = snapshot.docs[0].last_message
              temp[i].status = snapshot.docs[0].status
              var new_talk = 'talk_room.array['+i+']'
              this.setData({[new_talk]:temp[i]})
            }
          }
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
  ,
  onLoad(){
      this.get_talk()
  },
  onShow(){
    this.init_unread()
  },
  talk(e){
    wx.navigateTo({
      url: '../talk/talk?user='+JSON.stringify(this.data.talk_room.array[e.currentTarget.dataset.index].sender),
    })
  },
  init_unread(){
    // 根据全局未读信息更新页面提示
    var unread_message = getApp().globalData.unread_message
    this.setData({['unread.like']:0,['unread.notice']:0,['unread.comment']:0})
    if(unread_message.length){
      for(let i in unread_message){
        if(unread_message[i].type == 'like'){
          this.data.unread.like++
          this.setData({'unread.like':this.data.unread.like})
        }
        else if(unread_message[i].type == 'comment'){
          this.data.unread.comment++
          this.setData({'unread.comment':this.data.unread.comment})
        }
        else if(unread_message[i].type == 'notice'){
          this.data.unread.notice++
          this.setData({'unread.notice':this.data.unread.notice})
        }
      }
    }
    
  },
  show_detail(e){
      wx.navigateTo({
        url: './detail/detail?type='+e.currentTarget.dataset.index,
      })
  },
  get_talk(){
    this.setData({loading:true})
    // 获取所有聊天室数据
    wx.cloud.callFunction({
      name:'talk',
      data:{
        type:'get_talk_room',
        collection:'talk_room',
        skip:this.data.talk_room.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user1',
        },
        lookup2:{
          from: 'user',
          localField: '_openid2',
          foreignField: '_openid',
          as: 'user2',
        },
        project:{
          last_message:1,
          _openid:1,
          _openid2:1,
          'user1.name':1,
          'user1._openid':1,
          'user1.avatar':1,
          'user2.name':1,
          'user2._openid':1,
          'user2.avatar':1,
          status:1
        },
        match: {_openid:getApp().globalData.user._openid}
      }
    }).then(res=>{
      if(res.result.list.length){
        var temp = this.data.talk_room.array
        for(let i in res.result.list){
          if(res.result.list[i]._openid == getApp().globalData.user._openid){
            res.result.list[i].sender = res.result.list[i].user2[0]
          }
          else{
            res.result.list[i].sender = res.result.list[i].user1[0]
          }
          temp.push(res.result.list[i])
        }
        this.setData({'talk_room.array':temp})
        this.watch_talk_room()
        this.setData({loading:false})
      }
    })
  }
})