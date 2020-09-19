// miniprogram/pages/login/login.js
const db = wx.cloud.database()
Page({
  data: {
    text:'加载中'
  },
  onLoad: function (options) {
    this.login_check()
  },
  login_check(){
    // 登陆检测，如果数据中无该用户则需要获取信息
    return new Promise((suc,rej)=>{
      wx.cloud.callFunction({
        name:'login'
      }).then(res=>{
        const db = wx.cloud.database()
        db.collection('user')
        .where({_openid:res.result.openId})
        .get()
        .then(res=>{
          if(res.data.length){
            getApp().globalData.has_login = true
            getApp().globalData.user = res.data[0]
            wx.reLaunch({
              url: '../index/index',
            })

          }
          else{
            this.setData({text:'点击相机进入简约约拍'})
          }
          suc()
        })
      })
    })
  },
  login(e){
    if(this.data.text == '加载中'){
      return
    }
    // 获取用户信息保存在数据库
    wx.getSetting({
      success:res=>{
        if(!res.authSetting['scope.userInfo']){
          this.setData({actionsheet:true})
          return
        }
        else{
          wx.showLoading({
            title: '登陆中',
          })
          wx.getUserInfo().then(res=>{
            // 获取用户头像
            wx.getImageInfo({
              src: res.userInfo.avatarUrl,
            }).then(res=>{
              var timestamp=new Date().getTime()
              wx.cloud.uploadFile({
                cloudPath:'avatar/'+timestamp+res.path.match(/\.[^.]+?$/)[0],
                filePath:res.path
              }).then(res=>{
                const new_user = {
                  avatar:res.fileID,
                  name:e.detail.userInfo.nickName,
                  fans:[],
                  follow:[],
                  status:'normal',
                  favor:[]
                }
                db.collection('user').add({
                  data:new_user
                })
                .then(res=>{
                  wx.hideLoading()
                  new_user.post = []
                  getApp().globalData.has_login = true
                  getApp().globalData.user = new_user
                  this.setData({user:new_user,has_login:true})
                  wx.reLaunch({
                    url: '../index/index',
                  })
                })
              })
            }
            ,rej=>{
              wx.showToast({
                title: '登陆失败',
              })
            })
          })
          
        }
      }
    })
    
    
  },
})