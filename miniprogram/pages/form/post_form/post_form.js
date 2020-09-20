// miniprogram/pages/form/post_form/post_form.js
const db = wx.cloud.database()
Page({
  data: {
    img_list:[],
    upload_img:[],
    upload_num:0,
    text:''
  },
  onLoad: function (options) {

  },
  ChooseImage() {
    wx.chooseImage({
      count: 9-this.data.img_list.length, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res)
        if (this.data.img_list.length != 0) {
          this.setData({
            img_list: this.data.img_list.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            img_list: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.img_list,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
          this.data.img_list.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            img_list: this.data.img_list
          })
  },
  post(){
    if(this.data.text == '' && !this.data.img_list.length){
      return
    }
    if(!this.data.img_list.length){
      var timestamp=new Date().getTime()
          const new_post = {
            _id:''+timestamp+'',
            text:this.data.text,
            img:[],
            like:[]
          }
          db.collection('post').add({data:new_post}).then(res=>{
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '发布成功',
                  success:res=>{
                    setTimeout(function(){wx.switchTab({
                      url: '../../index/index',
                    })} ,1000)
                    }
                })
              },
            })
          })
          return
    }
    this.upload()
  },
  text_input(e){
    this.setData({text:e.detail.value})
  },
  upload(){
    wx.showLoading({
      title: '上传中',
    })
    var timestamp=new Date().getTime()
      wx.cloud.uploadFile({
        cloudPath:'post/'+timestamp+this.data.img_list[this.data.upload_num].match(/\.[^.]+?$/)[0],
        filePath:this.data.img_list[this.data.upload_num]
      }).then(result=>{
        this.data.upload_num++
        if(this.data.upload_num !== this.data.img_list.length){
          this.data.upload_img.push(result.fileID)
          this.upload()
        }
        else {
          this.data.upload_img.push(result.fileID)
          var date = new Date()
          const new_post = {
            _id:''+timestamp+'',
            text:this.data.text,
            img:this.data.upload_img,
            like:[],
            date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
          }
          db.collection('post').add({data:new_post}).then(res=>{
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '发布成功',
                  success:res=>{
                    setTimeout(function(){wx.switchTab({
                      url: '../../index/index',
                    })} ,1000)
                    }
                })
              },
            })
          })
        }
    })
  },
})