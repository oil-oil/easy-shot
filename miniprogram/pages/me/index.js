const db = wx.cloud.database()
Page({
  data: {
    user:''
  },
  onLoad(){
    this.setData({user:getApp().globalData.user})
  },
  show_order(e){
    wx.navigateTo({
      url: '../order/index?index='+e.currentTarget.dataset.index,
    })
  },
  show_user(){
    wx.navigateTo({
      url: '../user/user?user_id='+getApp().globalData.user._openid
    })
  },
  show_favor(){
    if(getApp().login_check()){
      wx.navigateTo({
        url: './favor/favor',
      })
    }
  },
  show_follow(){
    wx.navigateTo({
      url: './follow/follow',
    })
  },
  show_post(){
    wx.navigateTo({
      url: './post/post',
    })
  },
  change_info(){
    wx.navigateTo({
      url: '../form/info_form/info_form',
    })
  }
})