App({
  globalData: {
    color:'#A58AA9',
    has_login: false,
    region:[],
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
    // 通用提示弹窗
    wx.showModal({
      content:text,
      confirmColor:this.globalData.color,
      showCancel:false
    })
  },
  login_check(){
    // 实名认证检测,暂未实现
    if(!this.globalData.has_login){
      wx.showModal({
        content:'当前实名认证，请认证后使用',
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
    // 通用用户取消关注功能
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
    // 通用私信功能
    if(user_data._openid == this.globalData.user._openid){
      this.show_modal('你不能与自己私信')
      return
    }
    wx.navigateTo({
      url: '/pages/talk/talk?user='+JSON.stringify(user_data),
    })
  },
  show_user(_openid){
    // 通用展示用户页面功能
    wx.navigateTo({
      url: '/pages/user/user?user_id='+_openid,
    })
  },
  get_date(timestamp) {
    // 通用时间转换方法 
    var now=new Date(parseInt(timestamp)); 
    var year=now.getFullYear(); 
    var month=now.getMonth()+1; 
    var date=now.getDate(); 
    var hour=now.getHours(); 
    var minute=now.getMinutes(); 
    var second=now.getSeconds(); 
    return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
} 
})
