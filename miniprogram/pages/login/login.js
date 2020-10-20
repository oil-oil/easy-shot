// miniprogram/pages/login/login.js
var QQMapWX = require('../../utils/qqmap-wx-jssdk')
var qqmapsdk
const db = wx.cloud.database()
Page({
  data: {
    text:'加载中',
    actionsheet:false,
    loading:false
  },
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: 'FK4BZ-RGT6O-RISWJ-SMAJK-GVO3F-H4BKE'
  });
    
    this.login_check()
  },
  login_check(){
    // 登陆检测，如果数据中无该用户则需要获取信息
    this.setData({loading:true})
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
            wx.getLocation({
              type: 'wgs84',
              success:res=>{
                const latitude = res.latitude
                const longitude = res.longitude
                qqmapsdk.reverseGeocoder({
                  location:{
                    latitude,
                    longitude
                  },
                  success:res=>{
                    this.setData({loading:false})
                    getApp().globalData.region = [res.result.address_component.province,res.result.address_component.city,res.result.address_component.district]
                    wx.reLaunch({
                      url: '../index/index',
                    })
                  },
                  fail:res=>{
                    this.setData({loading:false})
                    wx.reLaunch({
                      url: '../index/index',
                    })
                  }
                  
                })
              },
              fail:res=>{
                this.setData({loading:false})
                wx.reLaunch({
                  url: '../index/index',
                })
              }
             })
          }
          else{
            this.setData({loading:false})
            this.setData({text:'首次登陆'})
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
    this.setData({loading:true})
    // 获取用户信息保存在数据库
    wx.getSetting({
      success:res=>{
        if(!res.authSetting['scope.userInfo']){
          this.setData({actionsheet:true})
          return
        }
        else{
          this.setData({loading:true})
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
                  wx:'',
                  tel:'',
                  intro:'',
                  favor:[]
                }
                db.collection('user').add({
                  data:new_user
                })
                .then(res=>{
                  this.setData({loading:false})
                  new_user.post = []
                  getApp().globalData.has_login = true
                  getApp().globalData.user = new_user
                  this.setData({user:new_user,has_login:true,loading:false})
                  wx.reLaunch({
                    url: '../index/index',
                  })
                })
              })
            }
            ,rej=>{
              this.setData({loading:false})
              wx.showToast({
                title: '登陆失败',
              })
            })
          })
          
        }
      }
    })
    
    
  },
  hide_actionsheet(){
    this.setData({actionsheet:false})
  },
})