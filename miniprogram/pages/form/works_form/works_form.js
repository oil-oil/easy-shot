const db = wx.cloud.database()
Page({
  data: {
    title:'',
    intro:'',
    img_list:[],
    upload_img:[],
    button_text:'确认发布',
    upload_num:0,
    tag:{
      flag:false,
      text:'',
      choose:[],
      list:['旅拍','情侣','校园','纪实','古风','婚礼','复古','穿搭','暗黑','儿童摄影','汉服','JK','Lolita','cosplay','和服','风景','胶片']
    },
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
  switch_add_modal(){
    this.setData({'tag.flag':!this.data.tag.flag})
  },
  tag_input(e){
    this.setData({'tag.text':e.detail.value})
  },
  add_tag(){
    if(this.data.tag.text == ''){
      getApp().show_modal('请输入正确标签')
      return
    }
    if(this.data.tag.choose.length>=5){
      getApp().show_modal('最多选择五个标签')
      return
    }
    var tag_list = this.data.tag.list,
    choose = this.data.tag.choose
    tag_list.push(this.data.tag.text)
    choose.push(this.data.tag.text)
    this.setData({'tag.choose':choose,'tag.list':tag_list,'tag.text':''})
    this.switch_add_modal()
  },
  choose_tag(e){
    const index = e.currentTarget.dataset.index
    const index2 = this.data.tag.choose.indexOf(this.data.tag.list[index])
    var temp = this.data.tag.choose
    if(index2 == -1){
      if(this.data.tag.choose.length>=5){
        getApp().show_modal('最多选择五个标签')
        return
      }
    temp.push(this.data.tag.list[index])
    }
    else{
      temp.splice(index2,1)
    }
    this.setData({'tag.choose':temp})
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
            text:this.data.intro,
            img:this.data.upload_img,
            type:'works',
            tag:this.data.tag.choose,
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
        }
    })
  },


})