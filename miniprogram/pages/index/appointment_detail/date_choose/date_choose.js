// miniprogram/pages/form/appoint_form/date_choose/date_choose.js

const db = wx.cloud.database()
Page({
  data: {
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: {},
    isTodayWeek: false,
    todayIndex: 0, 
    date_choose:'',
    appoint:'',
    remark:''
  },
  onLoad(e){
    this.setData({appoint:JSON.parse(e.appoint)})
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.dateInit();
    this.setData({
      year: year,
      month: month,
      isToday: {
        year:year,
        month:month,
        dateNum: now.getDate(),
      }
    })
  },
  dateInit: function (setYear, setMonth) {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = [];                       //需要遍历的日历数组数据
    let arrLen = 0;                         //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();                 //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + ',' + (month + 1) + ',' + 1).getDay();                          //目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();               //获取目标月有多少天
    let obj = {};
    let num = 0;
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        obj = {
          year:year,
          month:month + 1,
          dateNum: num
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let nowDay = nowDate.getDate()
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
    for(let i in dateArr){
      if(dateArr[i].year < nowYear){
        dateArr[i].status = 'past'
      }
      else if(dateArr[i].year == nowYear){
        if(dateArr[i].month < nowMonth){
          dateArr[i].status = 'past'
        }
        else if(dateArr[i].month == nowMonth){
          if(dateArr[i].dateNum >= nowDay){
            dateArr[i].status = 'futrue'
          }
          else{
            dateArr[i].status = 'past'
          }
        }
        else{
          dateArr[i].status = 'futrue'
        }
      }
      else{
        dateArr[i].status = 'futrue'
      }
    }
    this.setData({
      dateArr: dateArr
    })
    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },
  /**
   * 上月切换
   */
  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  /**
   * 下月切换
   */
  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  choose_date(e){
    if(this.data.dateArr[e.currentTarget.dataset.index].status=='futrue'){
      let temp = this.data.dateArr[e.currentTarget.dataset.index]
      this.setData({date_choose:temp})
    }
  },
  type_change(e){
    this.setData({'type.choose':e.detail.value})
    console.log(e)
  },
  remark_input(e){
    this.setData({remark:e.detail.value})
  },
  order(){
    if(this.data.date_choose == ''){
      getApp().show_modal('请选择一个约拍日期')
      return
    }
    wx.showLoading({
      title: '下单中',
    })
    var date = new Date()
    let new_message  = {
        _id:''+ date.getTime(),
        receiver:this.data.appoint.user[0]._openid,
        type:'notice',
        status:false,
    }
    const new_order = {
      date:''+new Date().getTime(),
      appoint_id:this.data.appoint._id,
      price:this.data.appoint.appoint_type=='free'?'互免约拍':this.data.appoint.price,
      adress:this.data.appoint.adress,
      appoint_date:this.data.date_choose,
      remark:remark,
      order_date:date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds(),
      status:'ongoing',
      user_id:this.data.appoint._openid
    }
    db.collection('appointment')
    .doc(this.data.appoint._id).update({
      data:{
        date_choose:db.command.pull(this.data.date_choose)
      }
    }).then(res=>{
      if(res.stats.updated === 1){
        db.collection('order').add({
          data:new_order
        }).then(res=>{
          new_message.about_id = res._id
          db.collection('message').add({
            data:new_message
          })
          wx.redirectTo({
            url: '../finish/finish?order_id='+res._id,
          })
        })
      }
      else{
        getApp().show_modal('这个日期刚刚被其他人选择了哦，请重新选择')
      }
    })
    
  } 
})