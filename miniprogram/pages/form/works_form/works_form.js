const db = wx.cloud.database()
Page({
  data: {
    title:'',
    intro:'',
    img_list:[],
    upload_img:[],
    button_text:'确认发布',
    upload_num:0,
    type:''
  },
  ChooseImage() {
    wx.chooseImage({
      count: 9, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
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
  title_input(e){
    this.setData({title:e.detail.value})
  },
  intro_input(e){
    this.setData({intro:e.detail.value})
  },
  type_change(e){
    this.setData({type:e.detail.value})
    console.log(e)
  },
  post(){
    if(this.data.title == ''){
      getApp().show_modal('请填写作品标题')
      return
    }
    if(this.data.intro == ''){
      getApp().show_modal('请填写作品描述')
      return
    }
    if(this.data.img_list.length == 0){
      getApp().show_modal('请至少上传一张作品')
      return
    }
    if(this.data.type == ''){
      getApp().show_modal('请选择作品类型')
      return
    }
    this.upload()
  },
  upload(){
    wx.showLoading({
      title: '发布中',
    })
    var timestamp=new Date().getTime()
      wx.cloud.uploadFile({
        cloudPath:'works/'+timestamp+this.data.img_list[this.data.upload_num].match(/\.[^.]+?$/)[0],
        filePath:this.data.img_list[this.data.upload_num]
      }).then(result=>{
        this.data.upload_num++
        if(this.data.upload_num !== this.data.img_list.length){
          this.data.upload_img.push(result.fileID)
          this.upload()
        }
        else {
          this.data.upload_img.push(result.fileID)
          const new_post = {
            _id:''+timestamp+'',
            title:this.data.title,
            intro:this.data.intro,
            img:this.data.upload_img,
            type:this.data.type,
            like:[]
          }
          db.collection('works').add({data:new_post}).then(res=>{
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