const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    top_bar:{
      now_tab:0,
      array:['进行中','待评价','已完成'],
    },
    ongoing:{
      array:[],
      skip:0,
      nomore:false
    },
    evaluate:{
      array:[],
      skip:0,
      nomore:false
    },
    finish:{
      array:[],
      skip:0,
      nomore:false
    },
    comment:{
      index:'',
      flag:false,
      text:'',
      star_num:5,
      star_text:[
        '非常差','差','一般','不错','非常好'
      ]
    }
  },
  async onLoad(e){
    this.get_ongoing()
    this.get_evaluate()
    this.get_finish()
  },
  switch_top_tab(e){
    var now_tab = 'top_bar.now_tab'
    this.setData({[now_tab]:e.currentTarget.dataset.index})
  },
  swiper_change(e){
    this.setData({['top_bar.now_tab']:e.detail.current})
  },
  show_detail(e){
    if(this.data.top_bar.now_tab === 0){
      wx.navigateTo({
        url: './order_detail/order_detail?_id='+this.data.ongoing.array[e.currentTarget.dataset.index]._id,
      })
    }
    else if(this.data.top_bar.now_tab === 1){
      wx.navigateTo({
        url: './order_detail/order_detail?_id='+this.data.evaluate.array[e.currentTarget.dataset.index]._id,
      })
    }
    else if(this.data.top_bar.now_tab === 2){
      wx.navigateTo({
        url: './order_detail/order_detail?_id='+this.data.finish.array[e.currentTarget.dataset.index]._id,
      })
    }
  },
  get_ongoing(){
    wx.showNavigationBarLoading()
    // 获取正在进行中的订单数据
    wx.cloud.callFunction({
      name:'lookup_order',
      data:{
        collection:'order',
        skip:this.data.ongoing.skip,
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
          order_date:1,
          type:1,
          'user.avatar':1,
          'user.name':1,
          'user._openid':1,
          appoint_date:1,
          'appointment.img':1,
          'price':1,
          'adress':1,
        },
        match:_.and([
          _.or([
            {
              _openid: getApp().globalData.user._openid
            },
            {
              user_id: getApp().globalData.user._openid
            }
          ])
        ]),
        match2:{status:'ongoing'}    
      }
    }).then(res=>{
      wx.hideNavigationBarLoading()
      if(res.result.list.length&&!this.data.ongoing.nomore){
        this.init_status(res.result.list)
        for(let i in res.result.list){
          var temp = this.data.ongoing.array
          temp.push(res.result.list[i])
          this.setData({['ongoing.array']:temp})
        }
      }
      else{
        this.data.ongoing.nomore = true
      }
    })
  },
  get_evaluate(){
    // 获取待评价的订单数据
    wx.cloud.callFunction({
      name:'lookup_order',
      data:{
        collection:'order',
        skip:this.data.evaluate.skip,
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
          order_date:1,
          type:1,
          appoint_id:1,
          'user.avatar':1,
          'user.name':1,
          'user._openid':1,
          appoint_date:1,
          'appointment.img':1,
          'price':1,
          'adress':1,
        },
        match:_.and([
          _.or([
            {
              _openid: getApp().globalData.user._openid
            }, 
            {
              user_id: getApp().globalData.user._openid
            }   
          ])
        ])
        ,
        match2:{status:'evalute'}
        
      }
    }).then(res=>{
      if(res.result.list.length&&!this.data.evaluate.nomore){
        this.init_status(res.result.list)
        for(let i in res.result.list){
          var temp = this.data.evaluate.array
          temp.push(res.result.list[i])
          this.setData({['evaluate.array']:temp})
        }
      }
      else{
        this.data.evaluate.nomore = true
      }
    })
  },
  get_finish(){
    // 获取已完成的订单数据
    wx.cloud.callFunction({
      name:'lookup_order',
      data:{
        collection:'order',
        skip:this.data.finish.skip,
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
          order_date:1,
          type:1,
          'user.avatar':1,
          'user.name':1,
          'user._openid':1,
          appoint_date:1,
          'appointment.img':1,
          'price':1,
          'adress':1,
        },
        match:_.and([
          _.or([
            {
              _openid: getApp().globalData.user._openid
            },
            {
              user_id: getApp().globalData.user._openid
            }
          ])
        ])
        ,
        match2:{status:'finish'}
      }
    }).then(res=>{
      if(res.result.list.length&&!this.data.finish.nomore){
        this.init_status(res.result.list)
        for(let i in res.result.list){
          var temp = this.data.finish.array
          temp.push(res.result.list[i])
          this.setData({['finish.array']:temp})
        }
      }
      else{
        this.data.finish.nomore = true
      }
    })
  },
  init_status(array){
    // 区分订单类型
    for(let i in array){
      if(array[i].user[0]._openid == getApp().globalData.user._openid){
        array[i].type = 'photographer'
      }
      else{
        array[i].type = 'model'
      }
    }
  },
  talk(e){
    getApp().talk(this.data.ongoing.array[e.currentTarget.dataset.index].user[0])
  },
  finish(e){
    // 完成约拍订单,改变订单状态
    var index = e.currentTarget.dataset.index
    wx.showModal({
      content:'你确认你的约拍已经完成了吗',
      confirmText:'确认完成',
      confirmColor:getApp().globalData.color,
      cancelText:'暂未完成',
      success:res=>{
        if(res.confirm){
          db.collection('order').doc(this.data.ongoing.array[index]._id)
          .update({
            data:{
              status:'evaluate'
            }
          }).then(res=>{
            wx.showToast({
              title: '完成约拍',
            })
            var temp = this.data.ongoing.array
            var temp2 = this.data.evaluate.array
            temp2.unshift(temp[index])
            temp.splice(index,1)
            this.setData({'ongoing.array':temp,'evaluate.array':temp2})
          })
        }
      }
    })
  },
  comment(e){
    // 弹出评论窗口,隐藏其他订单
    this.setData({'comment.flag':true,'comment.index':e.currentTarget.dataset.index})
  },
  hide_comment(){
    this.setData({'comment.flag':false,'comment.text':''})
  },
  choose_star(e){
    this.setData({'comment.star_num':e.currentTarget.dataset.index+1})
  },
  comment_input(e){
    this.setData({'comment.text':e.detail.value})
  },
  comment_post(){
    // 发布评价,更新订单状态
    var date = new Date()
    var index = this.data.comment.index
    console.log(this.data.evaluate.array[index]._id)
    var new_comment = {
      _id:''+ date.getTime(),
      text:this.data.comment.text,
      order_id:this.data.evaluate.array[index]._id,
      date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
      star:this.data.comment.star_num
    }
    db.collection('comment').add({
      data:new_comment
    }).then(res=>{
      wx.showToast({
        title: '评论成功',
      })
    })
    db.collection('order').doc(this.data.evaluate.array[index]._id)
    .update({
      data:{status:'finish'}
      }).then(res=>{
        var temp = this.data.evaluate.array
        var temp2 = this.data.finish.array
        temp2.unshift(temp[index])
        temp.splice(index,1)
        this.setData({'evaluate.array':temp,'finish.array':temp2})
      })
    this.hide_comment()
    
  }
})