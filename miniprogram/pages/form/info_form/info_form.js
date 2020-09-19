// miniprogram/pages/form/info_form/info_form.js
const db = wx.cloud.database()
Page({
  data: {
    user:'',
  },

  onLoad() {
    this.setData({user:getApp().globalData.user})
  },
  ChooseImage() {
    wx.chooseImage({
      count: 1, //最多添加九张图片
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
          this.setData({'user.avatar':res.tempFilePaths[0]})
        } 
      })
  },
  name_input(e){
    this.setData({'user.name':e.detail.value})
  },
  change_info(){
    wx.showLoading({
      title: '上传中',
    })
    var timestamp=new Date().getTime()
    wx.cloud.uploadFile({
      cloudPath:'appointment/'+timestamp+this.data.user.avatar.match(/\.[^.]+?$/)[0],
      filePath:this.data.user.avatar
    }).then(result=>{
      db.collection('user').where({_openid:this.data.user._openid})
      .update({
        data:{
          avatar:result.fileID,
          name:this.data.user.name
        }
      }).then(res=>{
        getApp().globalData.user.avatar = result.fileID
        getApp().globalData.user.name = this.data.name
        wx.hideLoading()
        wx.switchTab({
          url: '../../index/index',
        })
      })
      
      
  })
}
})