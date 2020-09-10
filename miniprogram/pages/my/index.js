// miniprogram/pages/my/index.js

import {
  queryLotteryRecordCounts
} from '../../api/user.js'

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    total1: 0,
    total2: 0,
    total3: 0,
    counts: {
      'awarded-lottery': 0,
      'total-lottery': 0,
      'waiting-lottery': 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    // this.refresh();
    this.onQueryTotal();

  },
  onQueryTotal: function() {
    // 调用云函数
    console.log('onQueryTotal')



    wx.cloud.callFunction({
      name: 'queryTotal',
      data: {

      }
    })
    .then(res => {
      console.log('[云函数] [queryTotal]: ', res)

      this.setData({
        total1: res.result.total1,
        total2: res.result.total2,
        total3: res.result.total3
      },()=>{
        wx.hideLoading()
      });
     
      
    }).catch(err => {
      wx.hideLoading()
      console.error('[云函数] [queryLottery] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  refresh() {

    queryLotteryRecordCounts().then(res => {

      if (res.result.errMsg === "query-lottery-record-counts:ok") {
        this.setData({
          counts: res.result.data.counts
        });
      }
      
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);

    this.refresh();

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})