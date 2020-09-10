// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const command = db.command;
const aggregate = command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {

  let subscribesRes = await db.collection("subscribe")
    .aggregate()
    .lookup({
      from: 'lottery',
      localField: 'lotteryId',
      foreignField: '_id',
      as: "subscribes"
    })
    .replaceRoot({
      newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$subscribes', 0]), '$$ROOT'])
    })
    .project({
      condition: 0,
      display: 0,
      pic: 0,
      sponsor: 0,
      subscribedTime: 0,
      subscribes: 0,
      type: 0,
      value: 0,
      winners: 0,
      _id: 0
    })
    .addFields({
      endTime: aggregate.dateToString({
        date: '$endTime',
        format: '%Y-%m-%d %H:%M:%S',
        timezone: 'Asia/Shanghai'
      })
    })
    .match({
      status: -1,
      pushed: command.neq(true)
    })
    .limit(100)
    .end();

  if (subscribesRes.list.length === 0) return {};

  let startTime = new Date().getTime();
  let sendMessageTasks = [];
  subscribesRes.list.forEach(subscribe => {

    sendMessageTasks.push(
      new Promise(async (resolve, reject) => {

        try {
          console.log("subscribeMessage.send.start");
          const sendMessageRes = await cloud.openapi.subscribeMessage.send({
            touser: subscribe.openid,
            page: '/pages/index/index?lotteryId=' + subscribe.lotteryId,
            lang: 'zh_CN',
            data: {
              thing2: {
                value: subscribe.rewards.map(reward => reward.name + '×' + reward.winners).join("；")
              },
              time1: {
                value: subscribe.endTime
              },
              thing3: {
                value: '您参加的抽奖正在开奖，点击查看'
              }
            },
            templateId: subscribe.subscribeId,
            // miniprogramState: 'developer'
            // miniprogramState: 'trial'
            miniprogramState: 'formal'
          });

          if (sendMessageRes.errMsg === 'openapi.subscribeMessage.send:ok') {
            console.log("subscribeMessage.send.end");
            resolve({
              errMsg: sendMessageRes.errMsg,
              errCode: sendMessageRes.errCode,
              data: {
                lotteryId: subscribe.lotteryId,
                openid: subscribe.openid
              }
            });
          } else {
            resolve({
              errMsg: sendMessageRes.errMsg,
              errCode: sendMessageRes.errCode,
              data: {
                lotteryId: subscribe.lotteryId,
                openid: subscribe.openid
              }
            });
          }
        } catch (error) {
          resolve({
            errMsg: error.errMsg,
            errCode: error.errCode,
            data: {
              lotteryId: subscribe.lotteryId,
              openid: subscribe.openid
            }
          });
        }

      })
    );

  });
  let sendMessageTaskResults = await Promise.all(sendMessageTasks);
  console.log(sendMessageTaskResults);
  console.log("subscribeMessage.send.finish, cost time:" + (new Date().getTime() - startTime) + "ms");
  let sendMessageOpenidMap = {};
  sendMessageTaskResults.forEach(sendMessageTaskResult => {
    sendMessageOpenidMap[sendMessageTaskResult.data.lotteryId] = sendMessageOpenidMap[sendMessageTaskResult.data.lotteryId] || [];
    sendMessageOpenidMap[sendMessageTaskResult.data.lotteryId].push(sendMessageTaskResult.data.openid);
  });
  let updateTasks = [];
  for (let lotteryId in sendMessageOpenidMap) {
    let updateTask = db.collection("subscribe")
      .where({
        lotteryId: lotteryId,
        openid: command.in(sendMessageOpenidMap[lotteryId])
      }).update({
        data: {
          pushed: true,
          pushedTime: new Date()
        }
      });
    updateTasks.push(updateTask);
  }
  return await Promise.all(updateTasks);

}