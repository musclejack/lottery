async function subscribeLotteryMessage(subscribeId, lotteryId) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'subscribe',
    // 传给云函数的参数
    data: {
      action: 'subscribe-lottery-message',
      subscribeId: subscribeId,
      lotteryId: lotteryId
    }
  });

}

module.exports = {
  subscribeLotteryMessage: subscribeLotteryMessage
}