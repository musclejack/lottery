async function queryCurrentUser() {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'user',
    // 传给云函数的参数
    data: {
      action: 'query-current-user'
    }
  });

}

async function authorize(userInfo) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'user',
    // 传给云函数的参数
    data: {
      action: 'authorize',
      userInfo: userInfo
    }
  });

}

async function queryLotteries(page, size) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'user',
    // 传给云函数的参数
    data: {
      action: 'query-lotteries',
      page: page,
      size: size
    }
  });

}


async function queryLotteryRecords(type, page, size) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'user',
    // 传给云函数的参数
    data: {
      action: 'query-lottery-records',
      type: type,
      page: page,
      size: size
    }
  });

}

async function queryLotteryRecordCounts() {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'user',
    // 传给云函数的参数
    data: {
      action: 'query-lottery-record-counts'
    }
  });

}

module.exports = {
  queryCurrentUser: queryCurrentUser,
  authorize: authorize,
  queryLotteries: queryLotteries,
  queryLotteryRecords: queryLotteryRecords,
  queryLotteryRecordCounts: queryLotteryRecordCounts
}