const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext()
    const result = await cloud.openapi.subscribeMessage.send({
        touser: OPENID,
        page: '/pages/index/index',
        data: {
          thing1: {
            value: '抽奖活动001'
          },
          time3: {
            value: event.time
          },
          thing5: {
            value: '请进入小程序查询'
          }
        },
        templateId: 'RJ6Wn2j52vZ7R06w-D-N7Mlw8W2DmnQ4sORsaJSeiAA'
      })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}