// components/loading/loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:Boolean
  },
  observers:{
    'show':function(show){
      this.setData(show)
    }
  },
  methods: {

  }
})
