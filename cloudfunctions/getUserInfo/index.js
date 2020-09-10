// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);

  const {
    OPENID
  } = cloud.getWXContext();

  console.log('openid',OPENID)

  try {
    return await db.collection('user')
    .where({
      openid: OPENID
    })
    .orderBy('authorizedTime', 'desc')
    .limit(20)
    .get()

  } catch(e) {
    console.error(e)
  }
}