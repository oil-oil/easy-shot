// miniprogram/pages/user/user.js
const db = wx.cloud.database()
Page({
  data: {
    _openid:'',
    top_bar:{
      now_tab:1,
      array:['作品','约拍','发现'],
      
    },
    user:'',
    status:{
        follow:false
    },
    post:{
      skip:0,
      array:[],
      index:0,
      nomore:false
    },
    works:{
      skip:0,
      array:[],
      index:0,
      nomore:false
    },
    appointment:{
      skip:0,
      array:[],
      index:0,
      nomore:false
    },
    refreshing:false,
  },
  onLoad(e){
    this.setData({_openid:e.user_id})
    this.get_user(e.user_id)
    this.get_post(e.user_id)
    this.get_appointment(e.user_id)
    this.get_works(e.user_id)
  },
  init_status(){
    if(getApp().globalData.user!==null){
      if(getApp().globalData.user.follow.indexOf(this.data.user._openid) !== -1){
        this.setData({'status.follow':true})
      }
    }  
  },
  get_post(_openid){
    wx.cloud.callFunction({
      name:'lookup_db',
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
        match:{_openid}
      }
    }).then(res=>{
      this.setData({refreshing:false})
      if(res.result.list.length&&!this.data.post.nomore){
        for(let i in res.result.list){
          res.result.list[i].status = false
          if(getApp().globalData.has_login == true){
            if(res.result.list[i].like.indexOf(getApp().globalData.user._openid)!==-1){
              res.result.list[i].status = true
            }   
          }
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
  get_appointment(_openid){
    wx.cloud.callFunction({
      name:'lookup_db',
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
        match:{_openid}
      }
    }).then(res=>{
      console.log(res)
      this.setData({refreshing:false})
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
  get_works(_openid){
    wx.cloud.callFunction({
      name:'lookup',
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
        match:{_openid}
      }
    }).then(res=>{
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
  get_user(_openid){
    db.collection('user').where({
      _openid:_openid
    })
    .get()
    .then(res=>{
      this.setData({user:res.data[0]})
      this.init_status()
    })
  },
  switch_top_tab(e){
    console.log(e.currentTarget.dataset.index)
    this.setData({['top_bar.now_tab']:e.currentTarget.dataset.index})
  },
  swiper_change(e){
    this.setData({['top_bar.now_tab']:e.detail.current})
  },
  show_detail(e){
    wx.navigateTo({
      url: '../index/'+e.currentTarget.dataset.page+'_detail/'+e.currentTarget.dataset.page+'_detail',
    })
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
  talk(){
    wx.navigateTo({
      url: '../talk/talk?user='+JSON.stringify(this.data.user),
    })
  },
  refresh(){
    var _openid = this.data._openid
    if(this.data.top_bar.now_tab == 0){
      this.setData({'works.array':[]})
      this.data.works.nomore = false
      this.data.works.skip = 0
      this.get_works(_openid)
    }
    if(this.data.top_bar.now_tab == 1){
      this.setData({'appointment.array':[]})
      this.data.appointment.nomore = false
      this.data.appointment.skip = 0
      this.get_appointment(_openid)
    }
    if(this.data.top_bar.now_tab == 2){
      this.setData({'post.array':[]})
      this.data.post.nomore = false
      this.data.post.skip = 0
      this.get_post(_openid)
    }
  },
  post_like(e){
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
    var _openid = this.data._openid
    if(this.data.top_bar.now_tab == 0 && !this.data.works.nomore){
      ++this.data.works.skip
      this.get_works(_openid)
    }
    if(this.data.top_bar.now_tab == 1 && !this.data.appointment.nomore){
      ++this.data.appointment.skip
      this.get_appointment(_openid)
    }
    if(this.data.top_bar.now_tab == 2 && !this.data.post.nomore){
      ++this.data.post.skip
      this.get_post(_openid)
    }
  },
  follow(){
    if(getApp().login_check()){
      if(!this.data.status.follow){
        getApp().follow(this.data.user._openid)
        this.setData({'status.follow':true})
      }
      else{
        getApp().unfollow(this.data.user._openid)
        this.setData({'status.follow':false})
      }
    }
  },
})