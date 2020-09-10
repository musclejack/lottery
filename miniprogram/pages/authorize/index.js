// miniprogram/pages/login/index.js

import {
  authorize
} from '../../api/user.js'

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onGetUserInfo(e) {

    wx.showLoading({
      title: '正在授权'
    });

    if (e.detail.errMsg === "getUserInfo:ok") {

      app.globalData.userInfo = e.detail.userInfo;

      authorize(e.detail.userInfo).then(res => {

        if (res.result.errMsg === 'user.authorize.ok' || res.result.errMsg === 'user.authorize:authorized') {

          app.onAuthorized(res.result.data.userInfo);
          wx.showLoading({
            title: '授权成功'
          });
          setTimeout(() => {
            wx.hideLoading();
            app.navigateBack();
          }, 1000);
          return;

        }

        wx.nextTick(() => {
          wx.showToast({
            title: '授权失败',
            icon: 'none',
            duration: 1000
          });
        });

      });

    } else {

      wx.nextTick(() => {
        wx.showToast({
          title: '授权失败',
          icon: 'none',
          duration: 1000
        });
      });

    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})