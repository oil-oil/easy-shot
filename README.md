# 简约约拍小程序-寻找你的专属摄影师的拍照小程序
***
- ## 前言：
- ***
  约拍小程序，基于OTO商业模式，“线上到线下”，用户线上可随时随地约拍符合自己风格的摄影师、摄影师提供线下的约拍服务。为消费者和热爱拍摄的摄影师构建一个联通的平台。

 - #### 技术栈：
   使用原生微信小程序开发wxml+wxss+js+colorUI样式库，后端及数据库使用小程序云开发

 - #### 开发团队介绍：
   云开发挑战赛**自习社**队伍，开发成员：**林志煌（主要开发），刘翠娟（程序设计）**
  联系微信：18316996303
 - #### 小程序实现功能：
    - 作品：作品发布 作品展示 作品点赞
    - 动态：发布动态  动态点赞 动态评论
    - 约拍信息：发布约拍  约拍展示   约拍收藏  约拍下单 
    - 订单：订单详情展示 订单完成  订单评价 下单后占用摄影师单日约拍时间
    - 用户：关注 切换关注模式 查看关注用户 查看用户信息  用户实时聊天
    - 约拍收藏功能
    - 关键词匹配搜索功能
    - 消息实时通知功能
# 基本功能实现方式
***
- #### 数据的添加：
   使用小程序云开发api```db.collection().add()```方法
- #### 数据的更新：
   使用小程序云开发api```db.collection().update()```方法
- #### 数据的删除：
   使用小程序云开发api```db.collection().removee()```方法
- #### 数据的读取：
   在实际数据读取中大量的使用了联表查询，联表查询使用的是云开发聚合函数```lookup()```方法
  例如一下云函数
```
云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env:'quick-note-90l6m'})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
// 云函数入口函数
    exports.main = async (event, context) => {
    try {
        var limit = 20
        return await 
     db.collection(event.collection)
    .aggregate()
    .sort({_id:-1}) 
    .lookup(event.lookup)
    .lookup(event.lookup2)
    .match(event.match)
    .skip(event.skip*limit)
    .limit(limit)
    .project(event.project)
    .end()
  } catch (e) {
    console.error(e)
  }
}
```
- #### 图片文件的上传：
调用云开发``` wx.cloud.uploadFile```api上传图片，多张图片使用递归上传，文件名称避免重复使用时间戳+后缀命名。如下例子：
 ```
 upload(){
    wx.showLoading({
      title: '发布中',
    })
    var timestamp=new Date().getTime()
      wx.cloud.uploadFile({
        cloudPath:'works/'+timestamp+this.data.img_list[this.data.upload_num].match(/\.[^.]+?$/)[0],
        filePath:this.data.img_list[this.data.upload_num]
      }).then(result=>{
        this.data.upload_num++
        if(this.data.upload_num !== this.data.img_list.length){
          this.data.upload_img.push(result.fileID)
          this.upload()
        }
        else {
          //dosomething
                    }
                })
              },
            })
          })
        }
    })
  },
 ```
 - #### 大量数据的获取的和页面的渲染逻辑：
    由于小程序性能限制，因此从数据库读取数据时使用```.skip(event.skip*limit)
     .limit(limit)
     .project(event.project)```三种聚合函数使数据分页并且只获取指定字段，每次数据库只读取
    页面的渲染逻辑是一个滚动窗口，每次只读取20条数据并渲染，当用户拖动到滚动窗口的底部时增加skip获取下一页的数据
- #### 实时聊天功能：
    使用云开发```Collection.watch(options: Object): Object```api,监听数据库的数据变化并实时渲染，如下例
```
onwatch(){
    // 监听数据库聊天数据,实时更新
    const watcher = db.collection('talk')
    .orderBy('_id', 'desc')
    .limit(1)
    .where(_.and([
      {
        receiver:_.or(this.data.receiver._openid,getApp().globalData.user._openid)
      },
      {
        _openid:_.or(this.data.receiver._openid,getApp().globalData.user._openid)
      }
    ])
    )
    .watch({
      onChange: snapshot=> {
        ++this.data.count
        if(this.data.count === 0 ){
          return
        }
        var temp = this.data.text_array
        if(snapshot.docs.length){
          if(snapshot.docs[0].receiver == getApp().globalData.user._openid){
            snapshot.docs[0].user = 'other'
          }
          else if(snapshot.docs[0].receiver == this.data.receiver._openid){
            snapshot.docs[0].user = 'me'
          }
          else{
            return
          }
        temp.push(snapshot.docs[0])
        this.setData({text_array:temp})
        this.setData({last_view:'last_view'})
        }
      },
      onError: err=> {
        console.error('the watch closed because of error', err)
      }
    }) 
  },
  ```
  - #### 登陆功能
    使用云开发鉴权获取用户_openid
```
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:'quick-note-90l6m'
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return event.userInfo
}
```
- #### 搜索功能
    使用云开发聚合函数中的正则匹配```title:db.RegExp({
            regexp: this.data.search_text,
            options: 'i',
          })```
# 设计风格
***
小程序的整体风格是偏向简约，开发过程中使用**colorUI**样式库，这对我们的开发效率有很大的帮助
主色系使用淡紫色```#A58AA9```，大部分图标使用colorUI提供的图标库
# 补充
***
目前小程序开发时间较为短，缺乏足够的测试，还有部分功能正在开发中，在后期我们将会使约拍小程序功能更加完善！




    
    
  


 





