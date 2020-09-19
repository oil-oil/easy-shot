// miniprogram/pages/form/appoint_form/date_choose/date_choose.js
const db = wx.cloud.database()
Page({

  data: {
    form:'',
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: {},
    isTodayWeek: false,
    todayIndex: 0,
    type:{
      array:['自由选择','随时接单'],
      choose:0,
      detail:['在下方日历中选择接单日期，只可选择本月日期，次月可继续添加',
      '无需选择接单日期，随时可以接单',
      ]
    },
    upload_num:0,
    upload_img:[],
    choose_array:[]
  },
  onLoad(e){
    this.data.form = JSON.parse(e.form)
    console.log(this.data.form)
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
  // 初始化日历，
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
    // 无法选择已经过去的日期
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
    if(this.data.dateArr[e.currentTarget.dataset.index].status!=='past'){
      let temp2 = this.data.choose_array
      let index= this.data.choose_array.indexOf(this.data.dateArr[e.currentTarget.dataset.index])
      if(index!==-1){
        temp2.splice(index,1)
        this.setData({choose_array:temp2})
      }
      else{
        temp2.push(this.data.dateArr[e.currentTarget.dataset.index])
          this.setData({choose_array:temp2})
      }
  
    }
   
  },
  // 更换接单日期类型
  type_change(e){
    this.setData({'type.choose':e.detail.value})
    console.log(e)
  },
  post(){
    if(this.data.type.choose == 0&&this.data.choose_array.length == 0){
      getApp().show_modal('请至少选择一个接单日期')
      return
    }
    this.upload()
  },
  upload(){
    wx.showLoading({
      title: '上传中',
      mask:true
    })
    var timestamp=new Date().getTime()
      wx.cloud.uploadFile({
        cloudPath:'appointment/'+timestamp+this.data.form.img[this.data.upload_num].match(/\.[^.]+?$/)[0],
        filePath:this.data.form.img[this.data.upload_num]
      }).then(result=>{
        this.data.upload_num++
        if(this.data.upload_num !== this.data.form.img.length){// 递归上传图片
          this.data.upload_img.push(result.fileID)
          this.upload()
        }
        else {// 图片上传完成后向数据库添加新的约拍信息
          this.data.upload_img.push(result.fileID)
          var timestamp=new Date().getTime()
          const form = this.data.form
          form.date_type = this.data.type.choose
          form._id = ''+timestamp
          form.img = this.data.upload_img
          if(this.data.type.choose == 0){
            form.date_choose = this.data.choose_array
          } 
          db.collection('appointment').add({data:form}).then(res=>{
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '发布成功',
                  success:res=>{
                    setTimeout(function(){wx.switchTab({
                      url: '../../../index/index',
                    })} ,1000)
                    }
                })
              },
            })
          })
        }
    })
  },
  
})