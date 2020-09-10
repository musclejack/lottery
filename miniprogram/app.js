//app.js

const cloud = require('cloud.js');

import {
  queryCurrentUser
} from 'api/user.js'

import {
  queryConfigs
} from 'api/config.js'

App({

  onLaunch: function () {

    this.userInfo = {};

    this.config = {
      subscribeIds: {
        "lottery-message-remind": "RJ6Wn2j52vZ7R06w-D-N7Mlw8W2DmnQ4sORsaJSeiAA"
      }
    };

    if (wx.cloud) {

      wx.cloud.init(cloud.config);

      this.launchLogic();

    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    }

  },

  launchLogic() {

    wx.showLoading({
      title: '请稍后',
      mask: true
    });
    queryConfigs().then(res => {
      res.result.data.configs.forEach(config => {
        this.config[config._id] = config.value;
      });
    }).catch(console.error);
    this.authorized = false;
    queryCurrentUser().then(res => {
      if (res.result.errMsg === 'user.query.ok') {
        this.onAuthorized(res.result.data.userInfo);
        this.authorized = true;
      }
      wx.hideLoading();
    }).catch(console.error);

  },


  onAuthorized(userInfo) {
    this.authorized = true;
    this.userInfo = userInfo;
  },

  getSubscribeId(type) {
    return this.config.subscribeIds[type];
  },

  navigateBack() {

    let currentPages = getCurrentPages();
    if (currentPages.length > 1) {
      wx.navigateBack({
        delta: 1
      });
      return;
    }
    this.navigateHome();

  },

  navigateHome() {

    wx.switchTab({
      url: '/pages/index/index'
    });

  },

  globalData: {
    userInfo: {
      avatarUrl: '/images/header.png',
      nickName: '游客',
    },
    openid: ''
  }

})