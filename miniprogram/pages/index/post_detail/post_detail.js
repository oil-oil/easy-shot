// miniprogram/pages/index/find_detail/find_detail.js
const db = wx.cloud.database()
Page({
  data:{
    post_array:[],
    height_array:[],
    swiper_height:0,
    current:0,
    status:{
      follow:false,
      like:false
    },
    comment:{
      text:'',
      array:[],
      skip:0,
      nomore:false
    }
  },
  onLoad(e){
    if(e.current !== 'undefined'){
      this.setData({current:e.current})
    }
    
    this.get_post(e._id)
    this.get_comment(e._id)
  },
  show_user(){
    getApp().show_user(this.data.post_array.user[0]._openid)
   },
  swiper_change(e){
    this.setData({current:e.detail.current})
  },
  get_post(_id){
    wx.cloud.callFunction({
      name:'lookup',
      data:{
        collection:'post',
        skip:0,
        lookup:{  
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user',
        },
        project:{
          'text':1,
          'user.name':1,
          'user.avatar':1,
          'user._openid':1,
          'date':1,
          'like':1,
          'img':1,
        },
        match:{_id}
      }
    }).then(res=>{
      if(!res.result.list.length){
        wx.hideLoading()
        wx.showModal({
          content:'这条动态已经被作者删除啦，看看其他动态把',
          confirmColor:getApp().globalData.color,
          showCancel:false,
          success:res=>{
            wx.navigateBack({
              delta: 1,
            })
          }
        })
        return
      }
      this.setData({post_array:res.result.list[0]})
      this.init_status()
    })
  },
  get_comment(_id){
    wx.cloud.callFunction({
      name:'lookup',
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
        match:{post_id:_id}
      }
    }).then(res=>{

      if(res.result.list.length&&!this.data.comment.nomore){
        for(let i in res.result.list){
          var temp = this.data.comment.array
          temp.push(res.result.list[i])
          this.setData({['comment.array']:temp})
        }
      }
      else{
        this.data.comment.nomore = true
      }
    })
  },
  img_load(e){
    var swiper_height = e.detail.height/e.detail.width
    var height = 'height_array['+e.currentTarget.dataset.index+']'
    this.setData({[height]:swiper_height})
  },
  init_status(){
      if(this.data.post_array.like.indexOf(getApp().globalData.user._openid)!==-1){
        this.setData({'status.like':true})
      }
      if(getApp().globalData.user.follow.indexOf(this.data.post_array.user[0]._openid) !== -1){
        this.setData({'status.follow':true})
      }
      var temp = this.data.post_array
      temp.date = getApp().get_date(temp._id)
      this.setData({post_array:temp})
  },
  follow(){
    // 关注功能
    if(!this.data.status.follow){
      if(this.data.post_array.user[0]._openid == getApp().globalData.user._openid){
        getApp().show_modal('你不能关注你自己')
        return
      }
      getApp().follow(this.data.post_array.user[0]._openid)
      this.setData({'status.follow':true})
    }
    else{
      getApp().unfollow(this.data.post_array.user[0]._openid)
      this.setData({'status.follow':false})
    }
  },
  like(){
    // 点赞并发送信息
    if(getApp().login_check()){
      if(!this.data.status.like){
        var date = new Date()
        db.collection('message').add({
          data:{
            _id:''+ date.getTime() +'',
            about_id:this.data.post_array._id,
            receiver:this.data.post_array.user[0]._openid,
            type:'like',
            date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
            status:false,
            from:'动态'
          }
        })
        db.collection('post')
        .doc(this.data.post_array._id)
        .update({
          data:{
            like:db.command.unshift(getApp().globalData.user._openid)
          }
        })
        .then(res=>{
          var temp = this.data.post_array.like
          temp.unshift(getApp().globalData.user._openid)
          this.setData({'post_array.like':temp,'status.like':true})
          wx.showToast({
            title: '点赞成功'
          })
        })
        }
        else{
          wx.showToast({
            title: '已经点过赞啦',
            icon:'none'
          })
        }
    }
  },
  comment_input(e){
    this.setData({'comment.text':e.detail.value})
  },
  load_more(){
    ++this.data.comment.skip
    this.get_comment()
  },
  send_comment(){
    if(this.data.comment.text == ''||!getApp().login_check()){
      return
    }
    var date = new Date()
    var new_comment = {
      _id:''+ date.getTime() +'',
      text:this.data.comment.text,
      post_id:this.data.post_array._id,
      date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
    }
    db.collection('comment').add({
      data:new_comment
    }).then(res=>{
      wx.showToast({
        title: '评论成功',
      })
      var temp = this.data.comment.array
      var user = [{_openid:getApp().globalData.user._openid,
                    name:getApp().globalData.user.name,
                    avatar:getApp().globalData.user.avatar
                  }]
      new_comment.user = user
      temp.unshift(new_comment)
      this.setData({'comment.array':temp,'comment.text':''})
    })
    db.collection('message').add({
      data:{
        _id:''+ date.getTime() +'',
        about_id:this.data.post_array._id,
        receiver:this.data.post_array.user[0]._openid,
        text:this.data.comment.text,
        type:'comment',
        date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
        status:false,
        from:'动态'
      }
    })
  }
})