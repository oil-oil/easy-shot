// miniprogram/pages/me/favor/favor.js
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate
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
    user:''
  },

  onLoad(){
    this.setData({user:getApp().globalData.user})
    this.get_appointment()
  },
  get_appointment(){
    wx.cloud.callFunction({
      name:'lookup_db_all',
      data:{
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
      console.log(res)
      if(res.result.list.length&&!this.data.appointment.nomore){
        for(let i in res.result.list){
          if(res.result.list[i].order.length){
            for(let j in res.result.list[i].order){
              if(res.result.list[i].order[j].type!=='model'){
                res.result.list[i].order.splice(j,1)
              }
            }
          }
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