// miniprogram/pages/index/appointment_detail/finish/finish.js
Page({

  data: {
    order_id:''
  },

  onLoad(e) {
  this.setData({order_id:e.order_id}) 
  },
  show_order(){
    wx.reLaunch({
      url: '../../../order/order_detail/order_detail?_id='+this.data.order_id,
    })
  }
})