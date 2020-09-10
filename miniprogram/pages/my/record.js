// miniprogram/pages/my/record.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    navigationIndex: 0,
    navigationType: 'awarded-lottery',
    navigations: [{
        name: '中奖记录',
        type: 'awarded-lottery'
      },
      {
        name: '待开奖',
        type: 'waiting-lottery'
      },
      {
        name: '所有抽奖',
        type: 'total-lottery'
      }
    ]
  },

  onNavigationChange(e) {

    let navigationIndex = e.detail.navigationIndex;
    this.setData({
      navigationIndex: navigationIndex,
      navigationType: this.data.navigations[navigationIndex].type
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    let externalNavigationIndex = Number(options.navigationIndex);
    if (!isNaN(externalNavigationIndex)) {
      this.setData({
        navigationIndex: externalNavigationIndex,
        navigationType: this.data.navigations[externalNavigationIndex].type
      });
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  onQueryRecords() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    this.selectComponent("#record-" + this.data.navigationType).onPullDownRefresh();

  },

  onReachBottom: function () {

    this.selectComponent("#record-" + this.data.navigationType).onReachBottom();

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})