// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);

  let lotteryId = event.lotteryId;

  const {
    OPENID
  } = cloud.getWXContext();

  try {
    return await db.collection('broadcast')
    .where({
      lotteryId: lotteryId,
      openid: OPENID
    })
    .count()

  } catch(e) {
    console.error(e)
  }
}