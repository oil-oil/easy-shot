const db = wx.cloud.database()
Component({
  properties:{
    user:Object,
    follow:Boolean,
    _openid:String
  },
  observers:{
    'user,follow':function(user,follow){
      this.setData(user,follow)
      this.setData({_openid:getApp().globalData.user._openid})
    }
  },
  methods:{
    follow(){
      let _openid = this.data.user._openid
      if(!this.data.follow){
        if(_openid == getApp().globalData.user._openid){
          getApp().show_modal('你不能关注你自己')
          return
        }
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
            title: '关注成功'
          })
        })
        this.setData({follow:true})
      }
      else{
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
        icon:'none'
      })
    })
        this.setData({follow:false})
      }
    },
    show_user(){
      wx.navigateTo({
        url: '/pages/user/user?user_id='+this.data.user._openid,
      })
     },
  }
})