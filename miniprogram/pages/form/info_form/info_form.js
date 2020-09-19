// miniprogram/pages/form/info_form/info_form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:''
  },

  onLoad() {
    this.setData({user:getApp().globalData.user})
  },


})