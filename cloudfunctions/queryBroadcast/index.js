// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  try {
    return await db.collection('broadcast')
    .orderBy('broadcastTime', 'desc')
    .limit(10)
    .get()

  } catch(e) {
    console.error(e)
  }
}