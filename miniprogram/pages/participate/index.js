// miniprogram/pages/participate/index.js

import {
  authorize
} from '../../api/user.js'

import {
  queryLottery,
  participate,
  queryParticipatedUsers
} from '../../api/lottery.js'

const app = getApp();
let rewardedVideoAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    participated: false,
    matched: false,
    loading: true,
    lotteryId: '',
    user: undefined,
    lottery: undefined,
    subscribeAlwaysGuideDisplaying: false,
    subscribeSettingGuideDisplaying: true,
    resultDialogDisplaying: false,
    authorized: true,
    poster: {
      width: 320,
      height: 980
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({
      lotteryId: options.lotteryId,
      authorized: app.authorized
    });
    if(wx.createRewardedVideoAd){
      rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: 'adunit-e6f48728d65b9fd4' })
      rewardedVideoAd.onLoad(() => {
        console.log('onLoad event emit')
      })
      rewardedVideoAd.onError((err) => {
        console.log('onError event emit', err)
      })
      // rewardedVideoAd.onClose((res) => {
      //   console.log('onClose event emit', res)
      // })
      rewardedVideoAd.onClose(res => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          that.onParticipate();
        } else {
          // 播放中途退出，不下发游戏奖励
        }
      })
  
    }
  },
  updateInfo: function(){

    const db = wx.cloud.database()

    const _ = db.command
    db.collection('lottery').doc(this.data.lotteryId).update({
      data: {
        // 表示指示数据库将字段自增 10
        num: _.inc(1)
      }
    })
    .then(res=>{
      console.log(res)
    })
    .catch(err=>{
      console.log(err);
    })
  },

  lottery: function(){
    this.onParticipate();
    // rewardedVideoAd.show()
    // .catch(() => {
    //     rewardedVideoAd.load()
    //     .then(() => rewardedVideoAd.show())
    //     .catch(err => {
    //       console.log('激励视频 广告显示失败')
    //     })
    // })
  },
  onParticipate(e) {

    if (app.authorized !== true) {
      wx.navigateTo({
        url: '/pages/authorize/index'
      });
      return;
    }

    wx.showLoading({
      title: '报名中',
      mask: true
    });
    if(this.data.lottery.status == 1){
      this.participate();
    }
    
    wx.hideLoading();
  

  },

  onTapMore() {

    app.navigateHome();

  },

  prevent(e) {},

  onHideResultDialog() {

    this.setData({
      resultDialogDisplaying: false
    });

  },

  onDisplayResultDialog() {

    this.setData({
      resultDialogDisplaying: true
    });

  },

  onContact(e) {

    wx.setClipboardData({
      data: this.data.user.rewardCode,
      success: function (res) {
        wx.showToast({
          title: '兑奖码已复制',
          icon: 'none'
        });
      }
    });

  },

  onGetUserInfo(e) {

    if (e.detail.errMsg === "getUserInfo:ok") {

      authorize(e.detail.userInfo).then(res => {

        if (res.result.errMsg === 'user.authorize.ok') {

          app.authorized = true;
          this.setData({
            authorized: true
          });
          wx.showToast({
            title: '授权成功',
            icon: 'none'
          });

        }

      });

    }

  },

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    this.getLottery();
    this.getParticipate();

  },
  getLottery: function(){

    wx.cloud.callFunction({
      name: 'getLottery',
      data: {
        lotteryId: this.data.lotteryId
      }
    })
    .then(res => {

      this.setData({
        loading: false
      });

      console.log('[云函数] [getLottery]: ', res)
      let lottery = res.result.data;
      if(!lottery.num){
        lottery.num = 0;
      }


      if (lottery.status === -1) {

        this.setData({
          lottery
        });

        setTimeout(() => {

          wx.nextTick(() => {
            this.setData({
              resultDialogDisplaying: true
            });
          });

        }, 500);

        return;

      }
      
      this.setData({
        lottery
      })
    
    }).catch(err => {
      console.error('[云函数] [getLottery] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  getParticipate: function(){
    wx.cloud.callFunction({
      name: 'getParticipate',
      data: {
        lotteryId: this.data.lotteryId
      }
    })
    .then(res => {
      console.log('[云函数] [getParticipate]: ', res)
      let participates = res.result.data;

      this.setData({
        participates
      })
    
    }).catch(err => {
      console.error('[云函数] [getParticipate] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  participate: function(){
    wx.cloud.callFunction({
      name: 'participate',
      data: {
        lotteryId: this.data.lotteryId
      }
    })
    .then(res => {
      console.log('[云函数] [participate]: ', res)
      wx.showToast({
        title: "报名成功",
        icon: "none"
      });

      this.setData({
        participated: true,
        'lottery.num': this.data.lottery.num+1
      },()=>{
        this.updateInfo();
      })
    
    }).catch(err => {
      console.error('[云函数] [participate] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  onTapSponsor() {

    if (this.data.lottery.sponsor.appId !== undefined) {
      wx.navigateToMiniProgram({
        appId: this.data.lottery.sponsor.appId
      });
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getTotal();
    this.getBroadcast();
    if (app.authorized == true) {
      this.getUserInfo();
    }
  },
  getUserInfo: function(){
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {
        lotteryId: this.data.lotteryId
      }
    })
    .then(res => {
      console.log('[云函数] [getUserInfo]: ', res)
      let user = res.result.data;

      this.setData({
        user
      })
    
    }).catch(err => {
      console.error('[云函数] [getUserInfo] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },

  getTotal: function(){
    wx.cloud.callFunction({
      name: 'getTotal',
      data: {
        lotteryId: this.data.lotteryId
      }
    })
    .then(res => {
      console.log('[云函数] [getTotal]: ', res)
      if(res.result.total > 0){
        this.setData({
          participated: true
        })
      }

    }).catch(err => {
      console.error('[云函数] [getTotal] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },

  getBroadcast: function(){
    wx.cloud.callFunction({
      name: 'getBroadcast',
      data: {
        lotteryId: this.data.lotteryId
      }
    })
    .then(res => {
      console.log('[云函数] [getBroadcast]: ', res)
      if(res.result.total > 0){
        this.setData({
          matched: true
        })
      }

    }).catch(err => {
      console.error('[云函数] [getTotal] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
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

    return {
      title: (this.data.lottery.share.sponsor ? this.data.lottery.share.sponsor : (app.userInfo.nickName === undefined ? '' : app.userInfo.nickName)) + '@你来抽“' + (this.data.lottery.share.title ? this.data.lottery.share.title : this.data.lottery.rewards.map(reward => reward.name).join("；").toString()) + '”',
      path: '/pages/index/index?lotteryId=' + this.data.lotteryId,
      imageUrl: this.data.lottery.share.imageUrl
    }

  }

})