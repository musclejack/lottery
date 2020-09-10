// components/lottery-record.js

import {
  queryLotteryRecords
} from '../api/user.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: 'awarded-lottery'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentPage: 1,
    pageSize: 10,
    totalPage: 1,
    noRecords: false,
    noMoreRecords: true,
    querying: true,
    records: []
  },

  ready() {
    wx.showLoading({
      title: '加载中',
    })
    // this.onQueryLotteryRecords();
    this.onQueryRecord();

  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    onQueryRecord: function() {
      // 调用云函数
      console.log('onQueryRecord')
      console.log('this.properties.type',this.properties.type);
      this.data.querying = true;
  
      wx.cloud.callFunction({
        name: 'queryRecord',
        data: {
          type: this.properties.type
        }
      })
      .then(res => {
        console.log('[云函数] [queryRecord]: ', res)
        
        let total = res.result.total;
        if(total == 0){
          this.setData({
            noRecords: true,
            noMoreRecords: true,
            records: []
          },()=>{
            wx.hideLoading()
          });
        }
        if(total > 0){
          this.setData({
            noRecords: false,
            noMoreRecords: true,
            records: res.result.data
          },()=>{
            wx.hideNavigationBarLoading();
            this.data.querying = false;
            wx.hideLoading()
          });
        }
  
  
  
        
      }).catch(err => {
        wx.hideLoading()
        console.error('[云函数] [queryLottery] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      })
    },
    onQueryLotteryRecords() {

      this.data.querying = true;
      queryLotteryRecords(this.properties.type, this.data.currentPage, this.data.pageSize).then(res => {

        this.data.querying = false;
        if (res.result.errMsg === 'lottery-record-page:none') {
          this.setData({
            noRecords: true,
            noMoreRecords: true,
            currentPage: res.result.data.currentPage,
            totalPage: res.result.data.totalPage,
            records: []
          });
          return;
        }
        this.setData({
          noRecords: false,
          currentPage: res.result.data.currentPage,
          records: res.result.data.records,
          totalPage: res.result.data.totalPage,
          noMoreRecords: res.result.data.totalPage <= res.result.data.currentPage
        });

      });

    },

    onPullDownRefresh() {

      wx.showNavigationBarLoading();
      this.data.currentPage = 1;
      this.onQueryLotteryRecords();
      setTimeout(() => {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }, 1000);

    },

    onReachBottom() {

      if (this.data.noMoreRecords) return;
      if (this.data.querying) return;

      this.queryMoreLotteryRecords();

    },

    queryMoreLotteryRecords() {

      if (this.data.currentPage >= this.data.totalPage) {
        return;
      }
      this.data.currentPage++;
      this.data.querying = true;
      wx.showNavigationBarLoading();
      queryLotteryRecords(this.properties.type, this.data.currentPage, this.data.pageSize).then(res => {
        wx.hideNavigationBarLoading();
        this.data.querying = false;
        if (res.result.errMsg === 'lottery-record-page:none') {
          this.setData({
            noRecords: true,
            noMoreRecords: true,
            currentPage: res.result.data.currentPage,
            totalPage: res.result.data.totalPage,
            records: []
          });
          return;
        }
        if (res.result.errMsg === 'lottery-record-page:empty') {
          this.setData({
            currentPage: res.result.data.currentPage,
            totalPage: res.result.data.totalPage,
            noMoreRecords: true
          });
          return;
        }
        this.setData({
          noRecords: false,
          currentPage: res.result.data.currentPage,
          records: this.data.records.concat(res.result.data.records),
          totalPage: res.result.data.totalPage,
          noMoreRecords: res.result.data.totalPage <= res.result.data.currentPage
        });
      });

    }

  }

})