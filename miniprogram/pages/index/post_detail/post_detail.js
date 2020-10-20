// miniprogram/pages/index/find_detail/find_detail.js
const db = wx.cloud.database()
Page({
  data:{
    type:'',
    loading:false,
    post_array:[],
    height_array:[],
    swiper_height:0,
    current:0,
    left_array:[],
    right_array:[],
    img_load:0,
    status:{
      follow:false,
      like:false
    },
    comment:{
      text:'',
      array:[],
      skip:0,
      nomore:false,
      focus:false,
      frist:''
    },
    user:{}
  },
  onLoad(e){
    if(e.current !== 'undefined'){
      this.setData({current:e.current})
    }
    if(typeof e.type !== 'undefined'){
      this.setData({type:'comment'})
    }
    this.get_post(e._id)
    this.get_comment(e._id)
  },
  show_comment(){
    this.setData({'comment.frist':'comment','comment.focus':true})
  },
  swiper_change(e){
    this.setData({current:e.detail.current})
  },
  get_post(_id){
    this.setData({loading:true})
    wx.cloud.callFunction({
      name:'post',
      data:{
        type:'get_detail',
        collection:'post',
        skip:0,
        lookup:{  
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user',
        },
        _openid:getApp().globalData.user._openid,
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
      if(res.result.list[0].type == 'works'){
        wx.setNavigationBarTitle({
          title: '作品集',
        })
        for(let i in res.result.list[0].img){
          if(i%2 == 0){
            var left = this.data.left_array
            left.push({img:res.result.list[0].img[i]})
            this.setData({left_array:left})
          }
          else{
            var right = this.data.right_array
            right.push({img:res.result.list[0].img[i]})
            this.setData({right_array:right})
          }
        }
      }
      else{
        wx.setNavigationBarTitle({
          title: '动态',
        })
        if(this.data.type == 'comment'){
          this.show_comment()
        }
      }
      this.setData({post_array:res.result.list[0],user:res.result.list[0].user[0]})
      this.init_status()
      this.setData({loading:false})
    })
  },
  get_comment(_id){
    wx.cloud.callFunction({
      name:'post',
      data:{
        type:'get_comment',
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
    if(this.data.post_array.type == 'post'){
      var swiper_height = e.detail.height/e.detail.width
      var height = 'height_array['+e.currentTarget.dataset.index+']'
      this.setData({[height]:swiper_height})
    }
    else{
      // 图片加载事件
    this.data.img_load++
    var type = e.currentTarget.dataset.type
    var index = e.currentTarget.dataset.index
    var height = parseFloat((e.detail.height/e.detail.width).toFixed(2)) 
    this.setData({[type+'_array['+index+'].height']:height})
    if(this.data.img_load == this.data.post_array.img.length){
      this.waterfull()
      if(this.data.type == 'comment'){
        this.show_comment()
      }
    }
    }
  },
  waterfull(){
    // 瀑布流,计算图片长度分配左右
    if(this.data.left_array.length&&this.data.right_array.length){
      var left_height = 0,
    right_height = 0
    var left = this.data.left_array
    var right = this.data.right_array
    for(let i in left){
      left_height += left[i].height
    }
    for(let i in right){
      right_height += right[i].height
    }
    if(left_height - left[left.length - 1].height >= right_height){
      left.pop()
      right.push(left[left.length - 1])
      this.setData({left_array:left,right_array:right})
      this.waterfull()
    }
    else if(right_height - right[right.length - 1].height > left_height){
      right.pop()
      left.push(right[right.length - 1])
      this.setData({left_array:left,right_array:right})
      this.waterfull()
    }
    
    }
  },
  init_status(){
      if(this.data.post_array.like_status){
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
          this.setData({'post_array.like_length':++this.data.post_array.like_length,'status.like':true})
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