// miniprogram/pages/form/appoint_form/date_choose/date_choose.js

const db = wx.cloud.database()
Page({
  data: {
    now_date:'',
    end_date:'',
    date:'点击选择',
    appoint:'',
    remark:'',
    tel:'',
    wx:'',
    user:{}
  },
  onLoad(e){
    const appoint = JSON.parse(e.appoint)
    const now_date = new Date().getFullYear() + '-' + (new Date().getMonth()+1) + '-' + new Date().getDate()
    const end_date = (new Date().getFullYear()+1) + '-' + (new Date().getMonth()+1) + '-' + new Date().getDate()
    this.setData(now_date,end_date)
    this.setData({appoint,user:appoint.user[0]})
    
  },
  date_change(e) {
    this.setData({
      date: e.detail.value
    })
  },
  remark_input(e){
    this.setData({remark:e.detail.value})
  },
  tel_input(e){
    this.setData({tel:e.detail.value})
  },
  wx_input(e){
    this.setData({wx:e.detail.value})
  },
  order(){
    if(this.data.date == '点击选择'){
      getApp().show_modal('请选择一个约拍日期')
      return
    }
    if(this.data.tel == ''){
      getApp().show_modal('请输入手机号码')
      return
    }
    if(this.data.wx == ''){
      getApp().show_modal('请输入微信号')
      return
    }
    wx.showLoading({
      title: '下单中',
    })
    var date = new Date()
    let new_message  = {
        _id:''+ date.getTime(),
        receiver:this.data.appoint.user[0]._openid,
        type:'notice',
        status:false,
    }
    const new_order = {
      date:''+new Date().getTime(),
      appoint_id:this.data.appoint._id,
      price:this.data.appoint.appoint_type=='free'?0:this.data.appoint.price,
      tel:this.data.tel,
      wx:this.data.wx,
      adress:this.data.appoint.adress,
      appoint_date:this.data.date,
      remark:this.data.remark,
      status:'ongoing',
      user_id:this.data.appoint._openid
    }
    db.collection('order').add({
      data:new_order
    }).then(res=>{
      new_message.about_id = res._id
      db.collection('message').add({
        data:new_message
      })
      wx.redirectTo({
        url: '../finish/finish?order_id='+res._id,
      })
    }) 
  } 
})