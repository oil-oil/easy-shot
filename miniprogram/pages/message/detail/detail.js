// miniprogram/pages/message/detail/detail.js
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    page_type:0,
    skip:0,
    message_array:[],
    nomore:false,
    nodata:false,
    loading:false
  },
  onLoad(e){
    this.setData({page_type:parseInt(e.type)})
    // 根据页面类型获取相应数据
    if(this.data.page_type === 0){
      this.get_like()
      wx.setNavigationBarTitle({
        title: '获得点赞',
      })
    }
    else if(this.data.page_type === 1){
      this.get_notice()
      wx.setNavigationBarTitle({
        title: '我的通知',
      })
    }
    else if(this.data.page_type === 2){
      this.get_comment()
      wx.setNavigationBarTitle({
        title: '获得评论',
      })
    }
  },
  get_like(){
    this.setData({loading:true})
    wx.cloud.callFunction({
      name:'message',
      data:{
        type:'get_all_data',
        collection:'message',
        skip:this.data.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'sender',
        },
        lookup2:{
          from: 'post',
          localField: 'about_id',
          foreignField: '_id',
          as: 'about',
        },
        project:{
           date:1,
          from:1,
          status:1,
          'sender.name':1,
          'sender.avatar':1,
          'sender._openid':1,
          'about._id':1,
          'about.img':1
        },
        match:{
          receiver:getApp().globalData.user._openid,
          type:'like'
        }
      }
    }).then(res=>{
      // 获取数据后更改状态为已读
      db.collection('message')
      .where({
        receiver:getApp().globalData.user._openid,
        type:'like'
      })
      .update({
        data:{
          status:true
        }
      })
      if(res.result.list.length){
        if(res.result.list.length < 20){
          this.data.nomore = true
        }
        for(let i in res.result.list){
          var temp = this.data.message_array
          temp.push(res.result.list[i])
        }
        this.setData({message_array:temp})
      }
      else{
        if(!this.data.message_array.length){
          this.setData({nodata:true})
        }
        this.data.nomore = true
      }
    })
    this.setData({loading:false})
  },
  get_notice(){
    this.setData({loading:true})
    wx.cloud.callFunction({
      name:'message',
      data:{
        type:'get_all_data',
        collection:'message',
        skip:this.data.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'sender',
        },
        lookup2:{
          from: 'order',
          localField: 'about_id',
          foreignField: '_id',
          as: 'about',
        },
        project:{
          date:1,
          from:1,
          status:1,
          'sender.name':1,
          'sender.avatar':1,
          'sender._openid':1,
          'about._id':1,
        },
        match:{
          receiver:getApp().globalData.user._openid,
          type:'notice'
        }
      }
    }).then(res=>{
      // 获取数据后更改状态为已读
      db.collection('message')
      .where({
        receiver:getApp().globalData.user._openid,
        type:'notice'
      })
      .update({
        data:{
          status:true
        }
      })
      
      if(res.result.list.length){
        if(res.result.list.length < 20){
          this.data.nomore = true
        }
        for(let i in res.result.list){
          var temp = this.data.message_array
          temp.push(res.result.list[i])
        }
        this.setData({message_array:temp})
      }
      else{
        if(!this.data.message_array.length){
          this.setData({nodata:true})
        }
        this.data.nomore = true
      }
      this.setData({loading:false})
    })
  },
  get_comment(){
    this.setData({loading:true})
    wx.cloud.callFunction({
      name:'message',
      data:{
        type:'get_all_data',
        collection:'message',
        skip:this.data.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'sender',
        },
        lookup2:{
          from: 'post',
          localField: 'about_id',
          foreignField: '_id',
          as: 'about',
        },
        project:{
          date:1,
          text:1,
          from:1,
          status:1,
          'sender.name':1,
          'sender.avatar':1,
          'sender._openid':1,
          'about._id':1,
          'about.img':1
        },
        match:{
          receiver:getApp().globalData.user._openid,
          type:'comment'
        }
      }
    }).then(res=>{
      
      // 获取数据后更改状态为已读
      db.collection('message')
      .where({
        receiver:getApp().globalData.user._openid,
        type:'comment'
      })
      .update({
        data:{
          status:true
        }
      })
      if(res.result.list.length){
        if(res.result.list.length < 20){
          this.data.nomore = true
        }
        for(let i in res.result.list){
          var temp = this.data.message_array
          temp.push(res.result.list[i])
        }
        this.setData({message_array:temp})
      }
      else{
        if(!this.data.message_array.length){
          this.setData({nodata:true})
        }
        this.data.nomore = true
      }
      this.setData({loading:false})
    })
  },
  load_more(){
    // 加载更多数据
    if(this.data.nomore){
      return
    }
    ++this.data.skip
    if(this.data.page_type == 0){
      this.get_like()
    }
    else if(this.data.page_type == 1){
      this.get_notice()
    }
    else if(this.data.page_type == 2){
      this.get_comment()
    }
  },
  show_user(e){
    getApp().show_user(this.data.message_array[e.currentTarget.dataset.index].sender[0]._openid)
  },
  show_detail(e){
    // 跳转至相应订单或内容
    if(this.data.page_type === 0){
        wx.navigateTo({
          url:'../../index/post_detail/post_detail?_id='+this.data.message_array[e.currentTarget.dataset.index].about[0]._id
        })
    }
    else if(this.data.page_type === 1){
      wx.navigateTo({
        url:'../../order/order_detail/order_detail?_id='+this.data.message_array[e.currentTarget.dataset.index].about[0]._id
      })
    }
    else if(this.data.page_type === 2){
      wx.navigateTo({
        url:'../../index/post_detail/post_detail?_id='+this.data.message_array[e.currentTarget.dataset.index].about[0]._id
      })
    }
    
  }
})