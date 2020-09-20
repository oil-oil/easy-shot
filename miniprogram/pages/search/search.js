// miniprogram/pages/me/favor/favor.js
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate
Page({
data:{
    appointment:{
      array:[],
      index:0,
    },
    search_text:''
  },

  onLoad: function (options) {
  },
  get_appointment(){
    // 正则匹配输入内容,实时搜索
    wx.cloud.callFunction({
      name:'lookup_db',
      data:{
        collection:'appointment',
        skip:0,
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
        match:{
          title:db.RegExp({
            regexp: this.data.search_text,
            options: 'i',
          })
        }
      }
    }).then(res=>{
      if(res.result.list.length){
        for(let i in res.result.list){
          if(res.result.list[i].order.length){
            for(let j in res.result.list[i].order){
              if(res.result.list[i].order[j].type!=='model'){
                res.result.list[i].order.splice(j,1)
              }
            }
          }
        }
      }
      this.setData({'appointment.array':res.result.list})
    })
  },
  show_detail(e){
    const page = e.currentTarget.dataset.page
    const index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../index/'+page+'_detail/'+page+'_detail?_id='+this.data[page].array[index]._id,
    })
  },
  input(e){
    this.setData({search_text:e.detail.value})
    if(this.data.search_text!==''){
      this.get_appointment()
    }
    else{
      this.setData({'appointment.array':[]})
    }
  }
})