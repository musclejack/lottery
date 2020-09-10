async function authorize(userInfo) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'wxacode',
    // 传给云函数的参数
    data: {
      action: 'authorize',
      userInfo: userInfo
    }
  });

}

async function getUnlimited() {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'wxacode',
    // 传给云函数的参数
    data: {
      action: 'get-unlimited'
    }
  });

}

module.exports = {
  authorize: authorize
}