App({
  globalData: {
    color:'#A58AA9',
    has_login: false,
    onwatch:{
      talk:false,
      message:false,
      talk_room:false
    },
    user: null,
    unread_message:[],
    new_talk:''
  },
  onLaunch(){
    wx.cloud.init({
      env:'quick-note-90l6m',
      traceUser:true
    })
  },
  
  show_modal(text){
    wx.showModal({
      content:text,
      confirmColor:this.globalData.color,
      showCancel:false
    })
  },
  login_check(){
    if(!this.globalData.has_login){
      wx.showModal({
        content:'当前暂未登陆，请登陆后使用',
        confirmText:'去登陆',
        cancelText:'暂不登陆',
        cancelColor:'#BBBBBB',
        confirmColor:getApp().globalData.color,
        success:res=>{
          if(res.confirm){
            wx.switchTab({
              url: '/pages/me/index',
            })
          }
        }
      })
      return false
    }
    else{
      return true
    }
  },
  follow(_openid){
    if(!this.login_check()){
      return
    }
    if(_openid == this.globalData.user._openid){
      this.show_modal('你不能关注你自己')
      return
    }
    const db = wx.cloud.database()
    db.collection('user')
    .where({_openid:_openid})
    .update({
      data:{
        fans:db.command.unshift(getApp().globalData.user._openid)
      }
    })
    db.collection('user')
    .where({_openid:getApp().globalData.user._openid})
    .update({
      data:{
        follow:db.command.unshift(_openid)
      }
    }).then(res=>{
      getApp().globalData.user.follow.unshift(_openid)
      wx.showToast({
        title: '关注成功',
      })
    })
    
  },
  unfollow(_openid){
    const db = wx.cloud.database()
    db.collection('user')
    .where({_openid:_openid})
    .update({
      data:{
        fans:db.command.pull(getApp().globalData.user._openid)
      }
    })
    db.collection('user')
    .where({_openid:getApp().globalData.user._openid})
    .update({
      data:{
        follow:db.command.pull(_openid)
      }
    }).then(res=>{
      var index = getApp().globalData.user.follow.indexOf(_openid)
      getApp().globalData.user.follow.splice(index,1)
      wx.showToast({
        title: '取消关注',
      })
    })
    
  },
  talk(user_data){
    if(!this.login_check()){
      return
    }
    if(user_data._openid == this.globalData.user._openid){
      this.show_modal('你不能与自己私信')
      return
    }
    wx.navigateTo({
      url: '/pages/talk/talk?user='+JSON.stringify(user_data),
    })
  },
  show_user(_openid){
    wx.navigateTo({
      url: '/pages/user/user?user_id='+_openid,
    })
  }
})
