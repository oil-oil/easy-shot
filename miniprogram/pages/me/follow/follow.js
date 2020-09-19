// miniprogram/pages/me/follow/follow.js
const db = wx.cloud.database()
const _ = db.command
Page({

  data: {
    skip:0,
    follow_array:[],
    nomore:false
  },

  onLoad: function (options) {
    this.get_follow()
  },
  get_follow(){
    db.collection('user').where({
      _openid:_.all(getApp().globalData.user.follow)
    }).get()
    .then(res=>{
      console.log(res)
      if(res.data.length){
        for(let i in res.data){
          var temp = this.data.follow_array
          temp.push(res.data[i])
          this.setData({follow_array:temp})
        }
      }
      else{
        this.data.nomore = true
      }
    })
  },
  load_more(){
    if(this.data.nomore){
      return
    }
    ++this.data.skip
    this.get_follow()
  },
  show_user(e){
    getApp().show_user(this.data.follow_array[e.currentTarget.dataset.index]._openid)
  }
})