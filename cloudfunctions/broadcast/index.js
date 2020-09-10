// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  let res = await db.collection("broadcast")
    .field({
      _id: 0,
      broadcastTime: 0,
      openid: 0,
      lotteryId: 0,
      rewardIndex: 0
    })
    .orderBy("broadcastTime", "desc")
    .limit(3)
    .get();

  if (res.errMsg !== 'collection.get:ok') {

    return {
      errMsg: 'query.broadcasts:ok',
      env: cloud.DYNAMIC_CURRENT_ENV
    }

  }

  console.log(res);

  res.data.forEach(broadcast => {
    console.log(broadcast);
    let nickName = broadcast.userInfo.nickName;
    broadcast.userInfo.nickName = new Array(nickName.length).join('*') + nickName.substr(-1)
  });

  return {
    errMsg: 'query.broadcasts:ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      broadcasts: res.data
    }
  }

}