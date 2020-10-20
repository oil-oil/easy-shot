// miniprogram/pages/me/favor/favor.js
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appointment:{
      skip:0,
      array:[],
      index:0,
      nomore:false
    },
    user:'',
    loading:false
  },

  onLoad(){
    this.setData({user:getApp().globalData.user})
    this.get_appointment()
  },
  get_appointment(){
    
    this.setData({loading:true})
    wx.cloud.callFunction({
      name:'appointment',
      data:{
        type:'get_favor',
        collection:'appointment',
        skip:this.data.appointment.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user',
        },
        lookup2:{
          from: 'order',
          localField: '_id',
          foreignField: 'appoint_id',
          as: 'order',
        },
        project:{
          'user.follow':0,
          'user.fans':0,
          'date_choose.status':0
        },
        match:getApp().globalData.user.favor
      }
    }).then(res=>{
      
      this.setData({loading:false})
      if(res.result.list.length&&!this.data.appointment.nomore){
        for(let i in res.result.list){
          var temp = this.data.appointment.array
          temp.push(res.result.list[i])
          this.setData({['appointment.array']:temp})
        }
      }
      else{
        this.data.appointment.nomore = true
      }
    })
  },
  load_more(){
      ++this.data.appointment.skip
      this.get_appointment()
  },
  show_detail(e){
    const page = e.currentTarget.dataset.page
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../../index/'+page+'_detail/'+page+'_detail?_id='+this.data[page].array[index]._id,
    })
  },
})