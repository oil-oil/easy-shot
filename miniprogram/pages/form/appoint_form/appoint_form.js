// miniprogram/pages/form/appoint_form/appoint_form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appoint_type:'',
    title:'',
    intro:'',
    include:[],
    region: ['广东省', '广州市', '从化区'],
    paydate:'',
    address:'',
    price:'',
    img_list:[]
  },
  onLoad(){
    
  },
  
  type_change(e){
    this.setData({appoint_type:e.detail.value})
  },
  title_input(e){
    this.setData({title:e.detail.value})
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
  address_input(e){
    this.setData({address:e.detail.value})
  },
  region_change: function(e) {
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
  // 表单验证
  choose_date(){
    if(this.data.type == ''){
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
    if(this.data.intro == ''){
      getApp().show_modal('请填写拍摄地址')
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
    if(this.data.img_list.length == 0){
      getApp().show_modal('请至少上传一张宣传图片')
      return
    }
    // 跳转至日期选择页面
    let form = JSON.stringify({
      appoint_type:this.data.appoint_type,
      title:this.data.title,
      intro:this.data.intro,
      include:this.data.include,
      region: this.data.region,
      paydate:this.data.paydate,
      price:this.data.price,
      address:this.data.address,
      img:this.data.img_list
    })
    wx.navigateTo({
      url: './date_choose/date_choose?form='+form,
    })
  }
})