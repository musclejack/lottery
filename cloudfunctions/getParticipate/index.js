// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);

  let lotteryId = event.lotteryId;

  try {
    return await db.collection('participate')
    .where({
      lotteryId: lotteryId
    })
    .orderBy('participatedTime', 'desc')
    .limit(20)
    .get()

  } catch(e) {
    console.error(e)
  }
}