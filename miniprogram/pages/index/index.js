const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate
Page({
  data: {
    page:"index",
    loading:false,
    red_dot:false,
    drawer:{
      flag:false,
      pageX:0
    },
    user:{},
    top_bar:{
      now_tab:0,
      array:['约拍','发现'],
    },
    add_modal:false,
    banner:[],
    post:{
      skip:0,
      array:[],
      index:0,
      follow:false,
      nomore:false,
      nodata:false
    },
    appointment:{
      skip:0,
      array:[],
      index:0,
      nomore:false
    },
    refreshing:false,
    region:[],
    status_height:0,
    unread_message:[]
  },
  onLoad(){
    console.time()
      var region = getApp().globalData.region
      if(region[0] == '所有范围'||region[1] == '所有范围'){
        region[1]  = ''
      }
      this.setData({region:region,status_height:getApp().globalData.status_height,user:getApp().globalData.user})
      this.get_post()//获取动态数据
      this.get_appointment()//获取约拍数据
      this.watch_message()//监听消息
      this.watch_talk()//监听私信
      this.get_banner()
  },
  onShow(){
    if(getApp().globalData.unread_message.length){
      this.setData({red_dot:true})
    }
  },
  get_post(){
    //调用云数据库，联表查询
    if(this.data.post.nomore){
      return
    }
    this.setData({loading:true})
    wx.cloud.callFunction({
      name:'post',
      data:{
        type:this.data.post.follow?'get_follow_data':'get_all_data',
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
        _openid:getApp().globalData.user._openid,
        match:this.data.post.follow?getApp().globalData.user.follow:{}
      }
    }).then(res=>{
      if(res.result.list.length){
        if(res.result.list.length < 20){
          this.data.post.nomore = true
        }
        for(let i in res.result.list){
          res.result.list[i].status = false
          if(res.result.list[i].like_status){
            res.result.list[i].status = true
          }
            res.result.list[i].date = getApp().get_date(res.result.list[i]._id)
          var temp = this.data.post.array
          temp.push(res.result.list[i])
          this.setData({['post.array']:temp})
        }
      }
      else{
        if(!this.data.post.array.length){
          this.setData({'post.nodata':true})
        }
        this.data.post.nomore = true
      }
      
      this.setData({refreshing:false})
      this.setData({loading:false})
    })
  },
  get_banner(){
    db.collection('banner').get().then(res=>{
      this.setData({banner:res.data})
    })
  },
  get_appointment(){
    if(this.data.appointment.nomore){
      return
    }
    this.setData({loading:true})
      var match,type
      type = 'get_all_data'
      if(this.data.region.length && this.data.region[0] == '所有范围'){
        match = {}
      }
      else{
        if(this.data.region[1] == '所有范围'){
          match = {'region.0':this.data.region[0]}
        }
        else{
          match = { 'region.0':this.data.region[0],'region.1':this.data.region[1]}
        }
      }
    //调用云数据库，联表查询
    wx.cloud.callFunction({
      name:'appointment',
      data:{
        type:type,
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
          'intro':1,
          'user.name':1,
          'user.avatar':1,
          'price':1,
          'region':1,
          'tag':1,
          'appoint_type':1,
          'img':1,
          'order.type':1,
          'browse':1
        },
        match:match
      }
    }).then(res=>{
      if(res.result.list.length){
        if(res.result.list.length < 20){
          this.data.appointment.nomore = true
        }
        for(let i in res.result.list){
          var temp = this.data.appointment.array
          temp.push(res.result.list[i])
          this.setData({['appointment.array']:temp})
        }
      }
      else{
        if(!this.data.appointment.array.length){
          this.setData({'appointment.nodata':true})
        }
        this.data.appointment.nomore = true
      }
    this.setData({refreshing:false})
    this.setData({loading:false})
    
    })
    
  },
  
  show_search(){
    wx.navigateTo({
      url: '../search/search',
    })
  },
  switch_follow(e){
    let index = e.currentTarget.dataset.index
   if(this.data.post.follow !== index){
     this.data.post.nomore = false
     this.setData({'post.follow':index,'post.array':[],'post.skip':0,'post.nodata':false})
     this.get_post()
   }
  },
  drawer_start(e){
    this.setData({'drawer.pageX':e.touches[0].pageX})
  },
  drawer_move(e){
    if(this.data.drawer.pageX - e.touches[0].pageX >=50){
      this.hide_drawer()
    }
  },
  show_drawer(){
    this.setData({'drawer.flag':true})
  },
  hide_drawer(){
    this.setData({'drawer.flag':false})
  },
  region_change(e) {
     var region = e.detail.value
      if(region[0] == '所有范围'||region[1] == '所有范围'){
        region[1]  = ''
      }
    this.setData({
      region: e.detail.value
    })
    wx.showToast({
      title: '更改地区',
      icon:'none'
    })
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
  show_comment(e){
    const index = e.currentTarget.dataset.index
      wx.navigateTo({
        url: '../index/post_detail/post_detail?_id='+this.data.post.array[index]._id+'&&type=comment',
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
      this.setData({'appointment.array':[],'appointment.nodata':false})
      this.data.appointment.nomore = false
      this.data.appointment.skip = 0
      this.get_appointment()
    }
    if(this.data.top_bar.now_tab == 1){
      this.setData({'post.array':[],'post.nodata':false})
      this.data.post.nomore = false
      this.data.post.skip = 0
      this.get_post()
    }
  },
  post_like(e){
    //动态点赞,并发送消息至动态发布者
    var index = e.currentTarget.dataset.index
    console.log(index)
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
            from:this.data.post.array[index].type == 'works'?'作品':'动态'
          }
        })
        db.collection('post')
        .doc(this.data.post.array[index]._id)
        .update({
          data:{
            like:_.unshift(getApp().globalData.user._openid)
          }
        })
        .then(res=>{
          var like_length = 'post.array['+index+'].like_length'
          var status = 'post.array['+index+'].status'
          this.setData({[like_length]:++this.data.post.array[index].like_length,[status]:true})
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
    
  },
  load_more(){
    // 滚动到底部加载更多数据
    if(this.data.top_bar.now_tab == 0 && !this.data.appointment.nomore){
      ++this.data.appointment.skip
      this.get_appointment()
    }
    if(this.data.top_bar.now_tab == 1 && !this.data.post.nomore){
      ++this.data.post.skip
      this.get_post()
    }
  },
  watch_message(){
    db.collection('message')
    .where({
      receiver:getApp().globalData.user._openid,
      status:false,
    })
    .watch({
      onChange:snapshot=> {
        if(snapshot.docs.length){
          this.setData({red_dot:true,unread_message:snapshot.docs})
          getApp().globalData.unread_message = snapshot.docs
          
        }
        else{
          this.setData({red_dot:false,unread_message:[]})
          getApp().globalData.unread_message = []
          
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
  ,
  watch_talk(){
    // 有新的消息显示底部栏红点
    db.collection('talk_room')
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
        if(snapshot.docs.length){
          this.setData({red_dot:true})
        }
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  }
  
})