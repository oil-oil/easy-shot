// miniprogram/pages/index/appointment_detail/appointment_detail.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appointment:[],
    height_array:[],
    swiper_height:0,
    current:0,
    date_type:
      ['摄影师指定时间',
      '随时可以接单',
      '只在周一至周五可接单',
      '只在周末可以接单'],
      status:{
        follow:false,
        favor:false
      },
      comment:{
        text:'',
        array:[],
        skip:0,
        nomore:false
      },
      order_array:[]
  },
  onLoad(e){
    this.get_appointment(e._id)
  },
  get_appointment(_id){
    wx.showNavigationBarLoading()
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
        match:{_id}
      }
    }).then(res=>{
      wx.hideNavigationBarLoading()
      if(res.result.list.length){
        wx.setNavigationBarTitle({
          title: res.result.list[0].title,
        })
        this.setData({appointment:res.result.list[0]})
        if(this.data.appointment.order.length){
          var temp = this.data.order_array
          for(let i in this.data.appointment.order){
            temp.push(this.data.appointment.order[i]._id)
          }
          this.setData({order_array:temp})
          this.get_comment()
        }
      }
      this.init_status()
    })
  },
  img_load(e){
    var swiper_height = e.detail.height/e.detail.width
    var height = 'height_array['+e.currentTarget.dataset.index+']'
    this.setData({[height]:swiper_height})
  },
  get_comment(){
    wx.cloud.callFunction({
      name:'lookup_all',
      data:{
        collection:'comment',
        skip:this.data.comment.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user',
        },
        project:{
          'text':1,
          'date':1,
          'user.name':1,
          'user._openid':1,
          'user.avatar':1,
        },
        where:'order_id',
        match:this.data.order_array
      }
    }).then(res=>{
      console.log(this.data.order_array)
      console.log(res)
      if(res.result.list.length&&!this.data.comment.nomore){
        for(let i in res.result.list){
          var temp = this.data.comment.array
          temp.push(res.result.list[i])
        }
        this.setData({['comment.array']:temp})
      }
      else{
        this.data.comment.nomore = true
      }
    })
  },
  init_status(){
      if(getApp().globalData.user.follow.indexOf(this.data.appointment.user[0]._openid) !== -1){
        this.setData({'status.follow':true})
      }
      if(getApp().globalData.user.favor.indexOf(this.data.appointment._id) !== -1){
        this.setData({'status.favor':true})
      }
      var temp = this.data.appointment
      temp.date = getApp().get_date(temp._id)  
      this.setData({appointment:temp})
  },
  show_user(){
    wx.navigateTo({
      url: '../../user/user?user_id='+this.data.post_array.user[0]._openid,
    })
  },
  swiper_change(e){
    this.setData({current:e.detail.current})
  },
  choose_date(){
      if(getApp().globalData.user._openid == this.data.appointment._openid){
        getApp().show_modal('你不能订购自己的约拍')
        return
      }
      wx.navigateTo({
        url: './date_choose/date_choose?appoint='+JSON.stringify(this.data.appointment) ,
      })
  },
  follow(){
    if(!this.data.status.follow){
      if(this.data.appointment.user[0]._openid == getApp().globalData.user._openid){
        getApp().show_modal('你不能关注你自己')
        return
      }
      getApp().follow(this.data.appointment.user[0]._openid)
      this.setData({'status.follow':true})
    }
    else{
      getApp().unfollow(this.data.appointment.user[0]._openid)
      this.setData({'status.follow':false})
    }
  },
  favor(){
    if(!getApp().login_check()){
      return
    }
    if(!this.data.status.favor){
      db.collection('user')
        .where({_openid:getApp().globalData.user._openid})
        .update({
          data:{
            favor:db.command.unshift(this.data.appointment._id)
          }
        }).then(res=>{
          getApp().globalData.user.favor.unshift(this.data.appointment._id)
          this.setData({'status.favor':true})
          wx.showToast({
            title: '收藏成功'
          })
        })
    }
    else if(this.data.status.favor){
      db.collection('user')
        .where({_openid:getApp().globalData.user._openid})
        .update({
          data:{
            favor:db.command.pull(this.data.appointment._id)
          }
        }).then(res=>{
          getApp().globalData.user.favor.splice(getApp().globalData.user.favor.indexOf(this.data.appointment._id),1)
          this.setData({'status.favor':false})
          wx.showToast({
            title: '取消收藏',
            icon:'none'
          })
        })
    }
  },
  talk(){
    getApp().talk(this.data.appointment.user[0])
  },
  show_user(){
    getApp().show_user(this.data.appointment.user[0]._openid)
   },
})