// miniprogram/pages/me/read_name/read_name.js
const db = wx.cloud.database
Page({
  data: {
    start_tag:false,
    idcard_1:'',
    idcard_2:''
  },
  start(){
    this.setData({start_tag:true})
  },
  ChooseImage(e) {
    var card = 'idcard_'+ e.currentTarget.dataset.index
    wx.chooseImage({
      count: 9, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
          this.setData({
            [card]:res.tempFilePaths
          })
      }
    });
  },
  DelImg(e) {
    var card = 'idcard_'+ e.currentTarget.dataset.index
          this.setData({
            [card]:''
          })
  },
  upload(){
    console
    if(this.data.idcard_1 === ''){
      getApp().show_modal('请上传身份证正面')
      return
    }
    if(this.data.idcard_2 === ''){
      getApp().show_modal('请上传身份证反面')
      return
    }
    wx.showLoading({
      title: '上传中',
    })
    var timestamp=new Date().getTime()
    wx.cloud.uploadFile({
      cloudPath:'read_name/'+timestamp+this.data.idcard_1[0].match(/\.[^.]+?$/)[0],
      filePath:this.data.idcard_1[0]
    }).then(res=>{
      var idcard_1 = res.fileID
      wx.cloud.uploadFile({
        cloudPath:'read_name/'+timestamp+this.data.idcard_2[0].match(/\.[^.]+?$/)[0],
        filePath:this.data.idcard_2[0]
      }).then(res=>{
        var idcard_2 = res.fileID
        db.collection('read_name').add({
          data:{
            idcard_1,
            idcard_2,
          }
        }).then(res=>{
          wx.hideLoading()
        })
      })
    })
  }
})