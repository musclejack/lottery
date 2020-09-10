async function queryBroadcasts() {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'broadcast',
    // 传给云函数的参数
    data: {
      action: 'query-broadcasts'
    }
  });

}

module.exports = {
  queryBroadcasts: queryBroadcasts
}