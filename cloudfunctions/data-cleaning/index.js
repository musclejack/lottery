// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const command = db.command;

// 云函数入口函数
exports.main = async (event, context) => {

  // return addBroadcasts();

  return resetSubscribePushedState();

}

async function addBroadcasts() {

  let lotteriesRes = await db.collection("lottery")
    .where({
      status: -1
    })
    .get();

  let addTasks = [];
  let addTask;
  for (let lottery of lotteriesRes.data) {

    lottery.winners.forEach((rewardWinners, rewardIndex) => {
      rewardWinners.forEach(winner => {
        addTask = db.collection("broadcast")
          .add({
            data: {
              broadcastTime: lottery.endTime,
              reward: lottery.rewards[rewardIndex].name,
              rewardIndex: rewardIndex,
              type: 'winner',
              lotteryId: lottery._id,
              openid: winner.openid,
              userInfo: winner.userInfo
            }
          });
        addTasks.push(addTask);
      });
    });

  }

  return await Promise.all(addTasks);
}

async function resetSubscribePushedState() {

  let subscribesRes = await db.collection("subscribe")
    .where({
      lotteryId: 'mBhoK6LXriSKoIDw8lRj5rjMXDUah2TftlkYkSVxDAfylT6Q'
    })
    .update({
      data: {
        pushed: command.remove(),
        pushedTime: command.remove()
      }
    });

  console.log(subscribesRes)
  return subscribesRes;

}