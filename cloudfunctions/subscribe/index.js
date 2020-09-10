// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const command = db.command;

const errorSubscribeRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'subscribe:error'
};

// 云函数入口函数
exports.main = async (event, context) => {

  switch (event.action) {
    case "subscribe-lottery-message":
      return subscribeLotteryMessage(event);
  }

}

async function subscribeLotteryMessage(event) {

  const wxContext = cloud.getWXContext();

  let res = await db.collection('subscribe').where({
    openid: wxContext.OPENID,
    subscribeId: event.subscribeId,
    lotteryId: event.lotteryId
  }).get();

  if (res.errMsg !== 'collection.get:ok') {

    return errorSubscribeRes;

  }

  if (res.data.length === 0) {

    res = await db.collection('subscribe').add({
      data: {
        openid: wxContext.OPENID,
        subscribeId: event.subscribeId,
        lotteryId: event.lotteryId,
        subscribedTime: new Date()
      }
    });
    
    if (res.errMsg !== 'collection.add:ok') {
      return errorSubscribeRes;
    }

    return {
      errMsg: 'subscribe.lottery:ok',
      env: cloud.DYNAMIC_CURRENT_ENV
    };

  }

  return {
    errMsg: 'subscribe.lottery:ok',
    env: cloud.DYNAMIC_CURRENT_ENV
  };

}