

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

  let res = await db.collection('user').where({
    openid: OPENID
  }).get();

  try {
    return await db.collection('participate').add({
      data: {
        openid: OPENID,
        lotteryId: lotteryId,
        userInfo: res.data[0]['userInfo'],
        participatedTime: new Date()
      }
    });

  } catch(e) {
    console.error(e)
  }
}