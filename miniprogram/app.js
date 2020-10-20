App({
  globalData: {
    color:'#A58AA9',
    has_login: false,
    region:[],
    user: null,
    unread_message:[],
    new_talk:'',
    status_height:0
  },
  onLaunch(){
    wx.cloud.init({
      env:'quick-note-90l6m',
      traceUser:true
    })
    this.globalData.status_height =  wx.getSystemInfoSync().statusBarHeight
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
