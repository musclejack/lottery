// miniprogram/pages/index/index.js
var util = require('../../utils/util.js');

let interstitialAd = null

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    broadcastIndex: 0, // 数据索引

    swiperIndex: 0, // swiper索引
    swiperInterval: 5000,
    swiperDuration: 500,
    defaultBroadcast: {
      type: 'text',
      text: '永远相信美好的事情即将发生'
    },
    broadcasts: [],
    broadcastIndexes: [],
    broadcastCount: 0,

    lotteries: [],
    currentPage: 1,
    pageSize: 10,
    totalPage: 1,
    noLottery: false,
    noMoreLottery: false,
    querying: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(wx.createInterstitialAd){
      interstitialAd = wx.createInterstitialAd({ adUnitId: 'adunit-2e7e41a5eb48f367' })
      interstitialAd.onLoad(() => {
        console.log('onLoad event emit')
      })
      interstitialAd.onError((err) => {
        console.log('onError event emit', err)
      })
      interstitialAd.onClose((res) => {
        console.log('onClose event emit', res)
      })
    }

    console.log(decodeURIComponent(options.scene))

    this.data.broadcastCount = 1;
    this.setData({
      broadcasts: [this.data.defaultBroadcast]
    }); 

    if (options.lotteryId) {
      wx.navigateTo({
        url: '/pages/participate/index?lotteryId=' + options.lotteryId
      });
    }

  },

  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onQueryBroadcasts: function() {
    // 调用云函数
    let that = this;
    wx.cloud.callFunction({
      name: 'queryBroadcast',
      data: {

      }
    })
    .then(res => {
      console.log('[云函数] [queryBroadcast]: ', res)
      res.result.data.unshift(this.data.defaultBroadcast);
      this.data.broadcastCount = res.result.data.length;
      this.setData({
        broadcasts: res.result.data
      });
      
    }).catch(err => {
      console.error('[云函数] [queryBroadcast] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  onQueryLottery: function() {
    // 调用云函数
    console.log('onQueryLottery')
    console.log('this.data.currentPage',this.data.currentPage)

    this.data.querying = true;

    wx.cloud.callFunction({
      name: 'queryLottery',
      data: {
        page: this.data.currentPage, 
        size: this.data.pageSize
      }
    })
    .then(res => {
      console.log('[云函数] [queryLottery]: ', res)
      
      let total = res.result.total;
      let totalPage = res.result.totalPage;
      if(total == 0){
        this.setData({
          noLottery: true,
          noMoreLottery: true,
          totalPage: totalPage,
          lotteries: []
        });
      }
      if(total > 0){
        this.setData({
          noLottery: false,
          noMoreLottery: totalPage <= this.data.currentPage,
          totalPage: totalPage,
          lotteries: res.result.data
        },()=>{
          wx.hideNavigationBarLoading();
          this.data.querying = false;
        });
      }



      
    }).catch(err => {
      console.error('[云函数] [queryLottery] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow');
    this.onQueryBroadcasts();
    this.onQueryLottery();
    
    interstitialAd.show().catch((err) => {
      console.error(err)
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
    console.log('onPullDownRefresh');
    // 这个地方相当于初始化的操作，类似于刷新
    wx.showNavigationBarLoading();
    this.data.currentPage = 1;
    this.onQueryLottery();
    setTimeout(() => {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 1000);

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    if (this.data.noMoreLottery) return;
    if (this.data.querying) return;

    this.onQueryMoreLottery();

  },
  onQueryMoreLottery: function() {
    // 调用云函数
    console.log('onQueryMoreLottery')
    console.log('this.data.currentPage',this.data.currentPage)
    let currentPage = this.data.currentPage+1;
    console.log('currentPage',currentPage)

    this.data.querying = true;
    wx.showNavigationBarLoading();

    wx.cloud.callFunction({
      name: 'queryMoreLottery',
      data: {
        page: currentPage, 
        size: this.data.pageSize
      }
    })
    .then(res => {
      console.log('[云函数] [queryMoreLottery]: ', res)
      
      this.setData({
        noLottery: false,
        currentPage,
        noMoreLottery: this.data.totalPage <= currentPage,
        lotteries: this.data.lotteries.concat(res.result.data)
      },()=>{
        wx.hideNavigationBarLoading();
        this.data.querying = false;
      });
      
    }).catch(err => {
      console.error('[云函数] [queryMoreLottery] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    })
  },

  onSwiperChange(e) {

    if (e.detail.source !== 'autoplay') return;
    //更新swiper索引
    let current = e.detail.current;
    let last = this.data.swiperIndex;
    this.data.swiperIndex = current;

    //更新数据索引
    if (current === last + 1 || last + 1 === this.data.broadcastIndexes.length + current) {
      //正向
      this.data.broadcastIndex++;
    } else {
      //逆向
      this.data.broadcastIndex--;
    }

    //数据索引边界处理
    if (this.data.broadcastIndex > this.data.broadcastCount - 1) {
      this.data.broadcastIndex = 0;
    } else if (this.data.broadcastIndex < 0) {
      this.data.broadcastIndex = this.data.broadcastCount - 1;
    }

    //确定三个item的数据值
    let next = this.data.broadcastIndex === this.data.broadcastCount - 1 ? 0 : this.data.broadcastIndex + 1;
    let pre = this.data.broadcastIndex === 0 ? this.data.broadcastCount - 1 : this.data.broadcastIndex - 1;

    //当前item不用处理，其他两个item更新显示；
    if (this.data.swiperIndex === 0) {
      this.data.broadcastIndexes[1] = next;
      this.data.broadcastIndexes[2] = pre;
    } else if (this.data.swiperIndex === 1) {
      this.data.broadcastIndexes[0] = pre;
      this.data.broadcastIndexes[2] = next;
    } else if (this.data.swiperIndex === 2) {
      this.data.broadcastIndexes[0] = next;
      this.data.broadcastIndexes[1] = pre;
    }
    this.setData({
      broadcastIndexes: this.data.broadcastIndexes
    });

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  goto: function(e){
    console.log(e.currentTarget.dataset);
    let lotteryId = e.currentTarget.dataset.id;
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: ['RJ6Wn2j52vZ7R06w-D-N7Mlw8W2DmnQ4sORsaJSeiAA'],
      success (res) { 
        console.log(res);
        that.newGo(lotteryId); 
      },
      fail (err){
        console.log(err);
        that.newGo(lotteryId); 
      }
    })
  },

  // 2020-07-21消息仅仅订阅，但是要到待开奖才会发送，通过触发器，在每个整点的10分开始执行
  newGo: function(lotteryId){
    
    this.result(lotteryId);
  },
  go: function(lotteryId){
    let time = util.formatTime(new Date());
    wx.cloud.callFunction({
      // 云函数名称
      name: 'send',
      // 传给云函数的参数
      data: {
        time: time
      },
    })
    .then(res => {
      console.log(res.result) // 3
      this.result(lotteryId);
    })
    .catch((err)=>{
      console.log(err);
      this.result(lotteryId);
    })


  },
  result: function(lotteryId){
    wx.navigateTo({
      url: '../participate/index?lotteryId='+lotteryId,
    })
  }

})