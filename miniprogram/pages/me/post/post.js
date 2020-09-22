// miniprogram/pages/user/user.js
const db = wx.cloud.database()
Page({
  data: {
    _openid:'',
    top_bar:{
      now_tab:0,
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
  onLoad(){
    this.get_post(getApp().globalData.user._openid)
    this.get_appointment(getApp().globalData.user._openid)
    this.get_works(getApp().globalData.user._openid)
  },
  get_post(_openid){
    wx.showNavigationBarLoading()
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
      wx.hideNavigationBarLoading()
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
    wx.showNavigationBarLoading()
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
      this.setData({refreshing:false})
      wx.hideNavigationBarLoading()
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
        url: '../../index/'+page+'_detail/'+page+'_detail?_id='+this.data[page].array[index]._id+'&current='+e.currentTarget.dataset.img_index,
      })
      return
    }
    wx.navigateTo({
      url: '../../index/'+page+'_detail/'+page+'_detail?_id='+this.data[page].array[index]._id,
    })
  },
  talk(){
    wx.navigateTo({
      url: '../talk/talk?user='+JSON.stringify(this.data.user),
    })
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
  delete(e){
    const index = e.currentTarget.dataset.index
    if(this.data.top_bar.now_tab == 0){
      wx.showModal({
        content:'你确定要删除这个作品吗',
        confirmText:'确认删除',
        confirmColor:getApp().globalData.color,
        success:res=>{
          if(res.confirm){
            wx.cloud.deleteFile({
              fileList:this.data.works.array[index].img
            }).then(res=>{
              db.collection('works').doc(this.data.works.array[index]._id)
              .remove().then(res=>{
                wx.showToast({
                  title: '删除成功',
                })
                var temp = this.data.works.array
                temp.splice(index,1)
                this.setData({'works.array':temp})
              })
            })
          }
        }
      })
    }
    if(this.data.top_bar.now_tab == 1 ){
      wx.showModal({
        content:'你确定要删除这个约拍吗',
        confirmText:'确认删除',
        confirmColor:getApp().globalData.color
      })
    }
    if(this.data.top_bar.now_tab == 2 ){
      wx.showModal({
        content:'你确定要删除这条动态吗',
        confirmText:'确认删除',
        confirmColor:getApp().globalData.color,
        success:res=>{
          if(res.confirm){
            if(this.data.post.array[index].img.length){
              wx.cloud.deleteFile({
                fileList:this.data.post.array[index].img
              }).then(res=>{
                db.collection('post').doc(this.data.post.array[index]._id)
                .remove().then(res=>{
                  wx.showToast({
                    title: '删除成功',
                  })
                  var temp = this.data.post.array
                  temp.splice(index,1)
                  this.setData({'post.array':temp})
                })
              })
            }
            else{
              db.collection('post').doc(this.data.post.array[index]._id)
              .remove().then(res=>{
                wx.showToast({
                  title: '删除成功',
                })
                var temp = this.data.post.array
                temp.splice(index,1)
                this.setData({'post.array':temp})
              })
            }
           
          }
        }
      })
    }
  }
})