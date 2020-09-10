async function fetchConfig(id) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'config',
    // 传给云函数的参数
    data: {
      action: 'fetch-config',
      id: id
    }
  });

}

async function queryConfigs() {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'config',
    // 传给云函数的参数
    data: {
      action: 'query-configs'
    }
  });

}

module.exports = {
  fetchConfig: fetchConfig,
  queryConfigs: queryConfigs
}