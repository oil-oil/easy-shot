// miniprogram/pages/order/order_detail/order_detail.js
Page({

  data: {
    order:[],
    user:{},
    status:''
  },
  onLoad(e){
    this.get_order(e._id)
    this.setData({user:getApp().globalData.user})
  } ,
  get_order(_id){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'order',
      data:{
        type:'get_detail',
        collection:'order',
        skip:0,
        lookup2:{
          from: 'appointment',
          localField: 'appoint_id',
          foreignField: '_id',
          as: 'appointment',
        },
        lookup:{
          from: 'user',
          localField: 'user_id',
          foreignField: '_openid',
          as: 'user',
        },
        project:{
          date:1,
          type:1,
          remark:1,
          tel:1,
          wx:1,
          'user.avatar':1,
          'user.name':1,
          'user._openid':1,
          'price':1,
          appoint_date:1,
          status:1,
          'appointment._id':1,
          'appointment.img':1,
          'appointment.title':1,
          'appointment.paydate':1,
        },
        match:{
          _id:_id
        }
      }
    }).then(res=>{
      wx.hideLoading()
      if(res.result.list[0].user[0]._openid == getApp().globalData.user._openid){
        res.result.list[0].type = 'photographer'
      }
      else{
        res.result.list[0].type = 'model'
      }
      res.result.list[0].date = getApp().get_date(res.result.list[0].date)
      this.setData({order:res.result.list[0]})
    })
  },
  talk(){
    getApp().talk(this.data.order.user[0])
  },
  show_detail(){
    wx.navigateTo({
      url: '../../index/appointment_detail/appointment_detail?_id='+this.data.order.appointment[0]._id,
    })
  },
  finish(){

  }
})