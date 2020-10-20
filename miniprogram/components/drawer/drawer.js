// components/drawer/drawer.js
Component({
  properties: {
    user:Object,
    status_height:Number,
    unread_message:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    message:'点击查看所有消息',
  },
  observers:{
    'user':function(user){
      this.setData(user)
    },
    'new_message_type':function(new_message_type){
      this.setData(new_message_type)
    },
    'unread_message':function(unread_message){
      console.log(unread_message)
      if(unread_message.length){
        console.log()
        switch (unread_message[0].type){
          case 'like' : 
            this.setData({message:'收到了新的点赞'})
            break
          case 'comment':
            this.setData({message:'收到了新的评论'})
            break
            case 'notice':
              this.setData({message:'收到了新的通知'})
              break
        }
      }
      else{
        this.setData({message:'点击查看所有消息'})
      }
      this.setData(unread_message)
    }
  },
  methods: {
    show_order(){
      wx.navigateTo({
        url: '/pages/order/index?index=',
      })
    },
    show_user(){
      wx.navigateTo({
        url: '/pages/user/user?user_id='+getApp().globalData.user._openid
      })
    },
    show_favor(){
      if(getApp().login_check()){
        wx.navigateTo({
          url: '/pages/me/favor/favor',
        })
      }
    },
    show_follow(){
      wx.navigateTo({
        url: '/pages/me/follow/follow',
      })
    },
    show_post(){
      wx.navigateTo({
        url: '/pages/me/post/post',
      })
    },
    show_identification(){
      wx.navigateTo({
        url: '/pages/me/identification/identification',
      })
    },
    show_read_name(){
      wx.navigateTo({
        url: '/pages/me/read_name/read_name',
      })
    },
    change_info(){
      wx.navigateTo({
        url: '../form/info_form/info_form',
      })
    },
    show_message(){
      wx.navigateTo({
        url: '/pages/message/index',
      })
    }
  },
  lifetimes: {
    attached() {
      this.setData({user:getApp().globalData.user,unread_num:getApp().globalData.unread_message.length})
    }
  }
})
