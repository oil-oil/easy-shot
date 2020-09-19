// miniprogram/pages/index/works_detail/works_detail.js
const db = wx.cloud.database()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    works_array:[],
    left_array:[],
    right_array:[],
    img_load:0,
    status:{
      follow:false,
      like:false
    }
  },
   onLoad(e){
    this.get_works(e._id)
  },
  init_status(){
    // 初始化状态
    if(getApp().globalData.user!==null){
      if(this.data.works_array.like.indexOf(getApp().globalData.user._openid)!==-1){
        this.setData({'status.like':true})
      }
      if(getApp().globalData.user.follow.indexOf(this.data.works_array.user[0]._openid) !== -1){
        this.setData({'status.follow':true})
        console.log(this.data.status)
      }
    
    }
      
  },
  get_works(_id){
    // 根据_id获取数据
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'lookup',
      data:{
        collection:'works',
        skip:0,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user',
        },
        project:{
          'title':1,
          'intro':1,
          'user._openid':1,
          'user.name':1,
          'user.avatar':1,
          'like':1,
          'img':1,
        },
        match:{_id}
      }
    }).then(res=>{
      this.setData({works_array:res.result.list[0]})
      this.init_status()
      for(let i in this.data.works_array.img){
        if(i%2 == 0){
          var left = this.data.left_array
          left.push({img:this.data.works_array.img[i]})
          this.setData({left_array:left})
        }
        else{
          var right = this.data.right_array
          right.push({img:this.data.works_array.img[i]})
          this.setData({right_array:right})
        }
      }
      
      wx.hideLoading()
    })
  },
  show_user(){
    // 跳转至用户页
   getApp().show_user(this.data.works_array.user[0]._openid)
  },
  img_load(e){
    // 图片加载事件
    this.data.img_load++
    var type = e.currentTarget.dataset.type
    var index = e.currentTarget.dataset.index
    var height = e.detail.height/e.detail.width
    this.setData({[type+'_array['+index+'].height']:height})
    if(this.data.img_load == this.data.works_array.img.length){
      this.waterfull()
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
    if(left_height - left[left.length - 1].height > right_height){
      left.pop()
      right.push(left[left.length - 1])
      this.setData({left_array:left,right_array:right})
      this.waterfull()
    }
    else if(right_height - right[right.length - 1].height >= left_height){
      right.pop()
      left.push(right[right.length - 1])
      this.setData({left_array:left,right_array:right})
      this.waterfull()
    }
    }
  },
  like(){
    // 点赞并发送消息
    if(getApp().login_check()){
      if(!this.data.status.like){
        var date = new Date()
        db.collection('message').add({
          data:{
            _id:''+ date.getTime() +'',
            about_id:this.data.works_array._id,
            receiver:this.data.works_array.user[0]._openid,
            type:'like',
            date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
            status:false,
            from:'作品'
          }
        })
        db.collection('works')
        .doc(this.data.works_array._id)
        .update({
          data:{
            like:db.command.unshift(getApp().globalData.user._openid)
          }
        })
        .then(res=>{
          var temp = this.data.works_array.like
          temp.unshift(getApp().globalData.user._openid)
          this.setData({'works_array.like':temp,'status.like':true})
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
  follow(){
    // 关注功能
    if(getApp().login_check()){
      if(!this.data.status.follow){
        getApp().follow(this.data.works_array.user[0]._openid)
        this.setData({'status.follow':true})
      }
      else{
        getApp().unfollow(this.data.works_array.user[0]._openid)
        this.setData({'status.follow':false})
      }
      console.log(this.data.status)
    }
  }
})