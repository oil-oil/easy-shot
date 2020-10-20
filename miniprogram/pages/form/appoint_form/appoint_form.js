// miniprogram/pages/form/appoint_form/appoint_form.js
const db = wx.cloud.database()
Page({
  data: {
    appoint_type:'',
    intro:'',
    include:[],
    region: [],
    paydate:'',
    price:'',
    img_list:[],
    tag:{
      flag:false,
      text:'',
      choose:[],
      list:['旅拍','情侣','校园','纪实','古风','婚礼','复古','穿搭','暗黑','儿童摄影','汉服','JK','Lolita','cosplay','和服','风景','胶片']
    },
    upload_num:0,
    upload_img:[],
    choose_array:[]
  },
  onLoad(){
    
  },
  
  type_change(e){
    this.setData({appoint_type:e.detail.value})
  },
  intro_input(e){
    this.setData({intro:e.detail.value})
  },
  paydate_input(e){
    this.setData({paydate:e.detail.value})
  },
  price_input(e){
    this.setData({price:e.detail.value})
  },
  region_change(e) {
    if(e.detail.value[0] == '所有范围'){
      e.detail.value[1] = e.detail.value[2]  = ''
    }
    else if(e.detail.value[1] == '所有范围'){
      e.detail.value[2]  = ''
    }
    this.setData({
      region: e.detail.value
    })
  },
  add_include(){
    var temp  = this.data.include
    temp.push('')
    this.setData({include:temp})
  },
  ChooseImage() {
    wx.chooseImage({
      count: 9-this.data.img_list.length, //最多添加九张图片
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
  delete_include(e){
    var index = e.currentTarget.dataset.index
    var temp  = this.data.include
    temp.splice(index,1)
    this.setData({include:temp})
  },
  include_input(e){
    var temp = this.data.include
    temp[e.currentTarget.dataset.index] = e.detail.value
    this.setData({include:temp})
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
  // 表单验证
 post(){
    if(this.data.appoint_type == ''){
      getApp().show_modal('请选择约拍类型')
      return
    }
    if(this.data.title == ''){
      getApp().show_modal('请填写约拍标题')
      return
    }
    if(this.data.intro == ''){
      getApp().show_modal('请填写约拍描述')
      return
    }
    if(this.data.price == ''&&this.data.appoint_type == 'special'){
      getApp().show_modal('请填写约拍单价')
      return
    }
    if(this.data.paydate == ''&&this.data.appoint_type == 'special'){
      getApp().show_modal('请填写约拍交付日期')
      return
    }
    if(this.data.include.length == 0){
      getApp().show_modal('请填写约拍包含内容')
      return
    }
    if(this.data.tag.length == 0){
      getApp().show_modal('请至少选择一个约拍主题标签')
      return
    }
    for(let i in this.data.include){
      if(this.data.include[i] == ''){
        getApp().show_modal('请填写约拍包含内容')
        return
      }
    }
    if(this.data.img_list.length == 0){
      getApp().show_modal('请至少上传一张宣传图片')
      return
    }
    // 跳转至日期选择页面
     this.data.form = {
      appoint_type:this.data.appoint_type,
      intro:this.data.intro,
      include:this.data.include,
      region: this.data.region,
      paydate:this.data.paydate,
      price:this.data.price,
      tag:this.data.tag.choose,
      img:this.data.img_list,
      browse:0
    }
    this.upload()
  },
  upload(){
    wx.showLoading({
      title: '上传中',
      mask:true
    })
    var timestamp=new Date().getTime()
      wx.cloud.uploadFile({
        cloudPath:'appointment/'+timestamp+this.data.form.img[this.data.upload_num].match(/\.[^.]+?$/)[0],
        filePath:this.data.form.img[this.data.upload_num]
      }).then(result=>{
        this.data.upload_num++
        if(this.data.upload_num !== this.data.form.img.length){// 递归上传图片
          this.data.upload_img.push(result.fileID)
          this.upload()
        }
        else {// 图片上传完成后向数据库添加新的约拍信息
          this.data.upload_img.push(result.fileID)
          var timestamp=new Date().getTime()
          const form = this.data.form
          form._id = ''+timestamp
          form.img = this.data.upload_img
          db.collection('appointment').add({data:form}).then(res=>{
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