function getSettingById(id) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'setting',
    // 传给云函数的参数
    data: {
      action: 'get-setting-by-id',
      id: id
    }
  });

}

function getUserSetting() {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'setting',
    // 传给云函数的参数
    data: {
      action: 'get-setting'
    }
  });

}

function saveUserSetting(setting) {

  return wx.cloud.callFunction({
    // 云函数名称
    name: 'setting',
    // 传给云函数的参数
    data: {
      action: 'save-setting',
      setting: setting
    }
  });

}

module.exports = {
  getSettingById: getSettingById,
  getUserSetting: getUserSetting,
  saveUserSetting: saveUserSetting
}