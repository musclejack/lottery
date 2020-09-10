const app = getApp();

async function queryLotteries(page, size, type = undefined) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'lottery',
    // 传给云函数的参数
    data: {
      action: 'query-lotteries',
      page: page,
      size: size,
      type: type
    }
  });

}

async function queryLottery(lotteryId) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'lottery',
    // 传给云函数的参数
    data: {
      action: 'query-lottery',
      lotteryId: lotteryId
    }
  });

}

async function participate(lotteryId) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'lottery',
    // 传给云函数的参数
    data: {
      action: 'participate',
      lotteryId: lotteryId
    }
  });

}

async function queryParticipatedUsers(page, size, lotteryId) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'lottery',
    // 传给云函数的参数
    data: {
      action: 'query-participated-users',
      page: page,
      size: size,
      lotteryId: lotteryId
    }
  });

}

module.exports = {
  queryLotteries: queryLotteries,
  queryLottery: queryLottery,
  participate: participate,
  queryParticipatedUsers: queryParticipatedUsers
}