// is-framework/components/is-navigation.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navigations: {
      type: Array,
      value: []
    },
    navigationIndex: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {

    tabSelect(e) {

      let navigationIndex = e.currentTarget.dataset.navigationIndex;
      if (this.data.navigationIndex === navigationIndex) return;
      this.setData({
        navigationIndex: navigationIndex
      });

      this.triggerEvent('change', {
        navigationIndex: navigationIndex
      });

    }

  }
})