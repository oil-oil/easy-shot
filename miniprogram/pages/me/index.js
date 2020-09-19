const db = wx.cloud.database()
Page({
  data: {
    has_login:false,
    actionsheet:false,
    user:''
  },
  onLoad(){
    wx.showLoading({
      title: '加载中',
    })
    this.setData({has_login:getApp().globalData.has_login})
    if(this.data.has_login){
      this.setData({user:getApp().globalData.user})
      db.collection('post')
      .where({openid:this.data.user.openid})
      .get().then(res=>{
        wx.hideLoading()
        var post = 'user.post'
        if(res.data.length){
          this.setData({[post]:res.data})
        }
        else{
          this.setData({[post]:[]})
        }
      })
      
    }
    else{
      wx.hideLoading()
    }
  },
  
  hide_actionsheet(){
    this.setData({actionsheet:false})
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