const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate
Page({
  data: {
    top_bar:{
      now_tab:1,
      array:['作品','约拍','发现'],
    },
    add_modal:false,
    post:{
      skip:0,
      array:[],
      index:0,
      only_follow:false,
      nomore:false
    },
    works:{
      skip:0,
      array:[],
      index:0,
      only_follow:false,
      nomore:false
    },
    appointment:{
      skip:0,
      array:[],
      index:0,
      only_follow:false,
      nomore:false
    },
    refreshing:false,
    region:[]
  },
  onLoad(){
      this.setData({region:getApp().globalData.region})
      this.get_works()//获取作品数据
      this.get_post()//获取动态数据
      this.get_appointment()//获取约拍数据
      this.watch_message()//监听消息
      this.watch_talk()//监听私信
  },
  onShow(){
    if(getApp().globalData.unread_message.length){
      wx.showTabBarRedDot({
        index: 1
      })
    }
  },
  get_post(){
    //调用云数据库，联表查询
    wx.cloud.callFunction({
      name:this.data.post.only_follow?'lookup_db_all2':'lookup_db',
      data:{
        collection:'post',
        skip:this.data.post.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user',
        },
        lookup2:{
          from: 'comment',
          localField: '_id',
          foreignField: 'post_id',
          as: 'comment',
        },
        project:{
          'comment._id':1,
          'text':1,
          'date':1,
          'user.name':1,
          'user._openid':1,
          'user.avatar':1,
          'like':1,
          'img':1,
          
        },
        match:this.data.post.only_follow?getApp().globalData.user.follow:{}
      }
    }).then(res=>{
      this.setData({refreshing:false})
      if(res.result.list.length&&!this.data.post.nomore){
        for(let i in res.result.list){
          res.result.list[i].status = false
            if(res.result.list[i].like.indexOf(getApp().globalData.user._openid)!==-1){
              res.result.list[i].status = true
            } 
            res.result.list[i].date = getApp().get_date(res.result.list[i]._id)
          var temp = this.data.post.array
          temp.push(res.result.list[i])
          this.setData({['post.array']:temp})
        }
      }
      else{
        this.data.post.nomore = true
      }
    })
  },
  get_appointment(){
    wx.showNavigationBarLoading()
    var match,name
    if(this.data.only_follow){
      match = getApp().globalData.user.follow
      name = 'lookup_db_all2'
    }
    else{
      name = 'lookup_db'
      if(this.data.region.length || this.data.region[0] == '任意区域'){
        match = {}
      }
      else{
        if(this.data.region[0] == '任意区域'){
          match = {}
        }
        else if(this.data.region[1] == '任意区域'){
          match = {'region.0':this.data.region[0]}
        }
        else{
          match = {'region.0':this.data.region[0],'region.1':this.data.region[1]}
        }
      }
    }
    //调用云数据库，联表查询
    wx.cloud.callFunction({
      name:name,
      data:{
        collection:'appointment',
        skip:this.data.appointment.skip,
        field:'_openid',
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
          'title':1,
          'user.name':1,
          'user.avatar':1,
          'price':1,
          'region':1,
          'appoint_type':1,
          'img':1,
          'order.type':1
        },
        match:match
      }
    }).then(res=>{
      this.setData({refreshing:false})
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
    wx.hideNavigationBarLoading()
  },
  get_works(){
    wx.showNavigationBarLoading()
    //调用云数据库，联表查询
    wx.cloud.callFunction({
      name:this.data.works.only_follow?'lookup_all':'lookup',
      data:{
        collection:'works',
        skip:this.data.works.skip,
        lookup:{
          from: 'user',
          localField: '_openid',
          foreignField: '_openid',
          as: 'user',
        },
        project:{
          'title':1,
          'intro':1,
          'user.name':1,
          'user.avatar':1,
          'like':1,
          'img':1,
        },
        match:this.data.works.only_follow?getApp().globalData.user.follow:{}
      }
    }).then(res=>{
      wx.hideNavigationBarLoading()
      this.setData({refreshing:false})
      if(res.result.list.length&&!this.data.works.nomore){
        for(let i in res.result.list){
          var temp = this.data.works.array
          temp.push(res.result.list[i])
          this.setData({['works.array']:temp})
        }
      }
      else{
        this.data.works.nomore = true
      }
    })
  },
  show_search(){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  only_follow(){
    // 切换为只显示关注用户,重新获取数据
    if(!getApp().login_check()){
      return
    }
    if(this.data.top_bar.now_tab == 0){
      if(this.data.works.only_follow){
        this.setData({'works.only_follow':false})
        wx.showToast({
          title: '查看所有',
          icon:'none',
          mask:true
        })
      }
      else{
        this.setData({'works.only_follow':true})
        wx.showToast({
          title: '只看关注',
          icon:'none',
          mask:true
        })
      }
    }
    if(this.data.top_bar.now_tab == 1){
      if(this.data.appointment.only_follow){
        this.setData({'appointment.only_follow':false})
        wx.showToast({
          title: '查看所有',
          icon:'none'
        })
      }
      else{
        this.setData({'appointment.only_follow':true})
        wx.showToast({
          title: '只看关注',
          icon:'none'
        })
      }
    }
    if(this.data.top_bar.now_tab == 2){
      if(this.data.post.only_follow){
        this.setData({'post.only_follow':false})
        wx.showToast({
          title: '查看所有',
          icon:'none'
        })
      }
      else{
        this.setData({'post.only_follow':true})
        wx.showToast({
          title: '只看关注',
          icon:'none'
        })
      }
    }
    this.refresh()
  },
  region_change(e) {
    this.setData({
      region: e.detail.value
    })
    wx.showToast({
      title: '更改地区',
      icon:'none'
    })
    console.log(this.data.region)
    this.refresh()
  },
  switch_top_tab(e){
    var now_tab = 'top_bar.now_tab'
    this.setData({[now_tab]:e.currentTarget.dataset.index})
  },
  swiper_change(e){
    this.setData({['top_bar.now_tab']:e.detail.current})
  },
  switch_add_modal(){
    if(getApp().login_check()){
      this.setData({add_modal:!this.data.add_modal})
    }  
  },
  show_detail(e){
    const page = e.currentTarget.dataset.page
    const index = e.currentTarget.dataset.index
    if(page == 'post'){
      wx.navigateTo({
        url: '../index/'+page+'_detail/'+page+'_detail?_id='+this.data[page].array[index]._id+'&current='+e.currentTarget.dataset.img_index,
      })
      return
    }
    wx.navigateTo({
      url: '../index/'+page+'_detail/'+page+'_detail?_id='+this.data[page].array[index]._id,
    })
  },
  show_form(e){
    this.setData({add_modal:false})
    wx.navigateTo({
      url: '../form/'+e.currentTarget.dataset.page+'_form/'+e.currentTarget.dataset.page+'_form',
    })
  },
  refresh(){
    // 下拉刷新
    if(this.data.top_bar.now_tab == 0){
      this.setData({'works.array':[]})
      this.data.works.nomore = false
      this.data.works.skip = 0
      this.get_works()
    }
    if(this.data.top_bar.now_tab == 1){
      this.setData({'appointment.array':[]})
      this.data.appointment.nomore = false
      this.data.appointment.skip = 0
      this.get_appointment()
    }
    if(this.data.top_bar.now_tab == 2){
      this.setData({'post.array':[]})
      this.data.post.nomore = false
      this.data.post.skip = 0
      this.get_post()
    }
  },
  post_like(e){
    //动态点赞,并发送消息至动态发布者
    var index = e.currentTarget.dataset.index
    if(getApp().login_check()){
      if(!this.data.post.array[index].status){
        var date = new Date()
        db.collection('message').add({
          data:{
            _id:''+ date.getTime() +'',
            about_id:this.data.post.array[index]._id,
            receiver:this.data.post.array[index].user[0]._openid,
            type:'like',
            date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
            status:false,
            from:'动态'
          }
        })
        db.collection('post')
        .doc(this.data.post.array[index]._id)
        .update({
          data:{
            like:db.command.unshift(getApp().globalData.user._openid)
          }
        })
        .then(res=>{
          var temp = this.data.post.array[index].like
          temp.unshift(getApp().globalData.user._openid)
          const like = 'post.array['+index+'].like'
          const status = 'post.array['+index+'].status'
          this.setData({[like]:temp,[status]:true})
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
  load_more(){
    // 滚动到底部加载更多数据
    if(this.data.top_bar.now_tab == 0 && !this.data.works.nomore){
      ++this.data.works.skip
      this.get_works()
    }
    if(this.data.top_bar.now_tab == 1 && !this.data.appointment.nomore){
      ++this.data.appointment.skip
      this.get_appointment()
    }
    if(this.data.top_bar.now_tab == 2 && !this.data.post.nomore){
      ++this.data.post.skip
      this.get_post()
    }
  },
  watch_message(){
    const watcher = db.collection('message')
    .where({
      receiver:getApp().globalData.user._openid,
      status:false,
    })
    .watch({
      onChange:snapshot=> {
        // 有新的消息显示底部栏红点
        if(snapshot.docs.length){
          wx.showTabBarRedDot({
            index: 1,
            fail:res=>{
              console.log('不在主页')
            }
          })
          getApp().globalData.unread_message = snapshot.docs
        }
        else{
          getApp().globalData.unread_message = []
        }
        console.log('message', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
  ,
  watch_talk(){
    // 有新的消息显示底部栏红点
    const talk_watcher = db.collection('talk_room')
    .where(_.and([
      {
        _openid:getApp().globalData.user._openid
      },
      {
        status:0
      }
    ]))
    .limit(1)
    .watch({
      onChange:snapshot=> {
        console.log('new_talk', snapshot)
        if(snapshot.docs.length){
          wx.showTabBarRedDot({
            index: 1,
            fail:res=>{
              console.log('不在主页')
            }
          })
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
  
})