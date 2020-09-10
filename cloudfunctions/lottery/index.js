// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const command = db.command;
const aggregate = db.command.aggregate;

const queryErrorRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'lottery-query:error'
};

const unauthorizedErrorRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'lottery-unauthorized:error'
};

const participateErrorRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'lottery-participate:error',
  errCode: -1
};

const participateOkRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'lottery-participate:ok'
};

// 云函数入口函数
exports.main = async (event, context) => {

  switch (event.action) {
    case "query-lottery":
      return queryLottery(event);
    case "query-lotteries":
      return queryLotteries(event);
    case "participate":
      return participate(event);
    case "query-participated-users":
      return queryParticipatedUsers(event);
  }

}

async function queryLotteries(event) {

  let type = event.type;

  let pageIndex = event.page - 1;
  let pageSize = event.size;
  let skipIndex = pageIndex * pageSize;
  let total;
  let totalPage;
  let lotteriesRes;
  let countRes;
  if (type !== undefined) {
    countRes = await db.collection('lottery').where({
      status: 1,
      type: type
    }).count();

    total = countRes.total;
    if (total === 0) {
      return {
        env: cloud.DYNAMIC_CURRENT_ENV,
        errMsg: 'lottery-query-page:none',
        data: {
          currentPage: 1,
          totalPage: 0
        }
      };
    }
    totalPage = Math.floor((total - 1) / pageSize) + 1;
    if (skipIndex >= total) {
      return {
        env: cloud.DYNAMIC_CURRENT_ENV,
        errMsg: 'lottery-query-page:empty',
        data: {
          currentPage: pageIndex > totalPage ? totalPage : pageIndex,
          totalPage: totalPage
        }
      };
    }

    lotteriesRes = await db.collection('lottery')
      .where({
        status: 1,
        type: type
      })
      .field({
        sponsor: false,
        "condition.type": false,
        "condition.value": false,
        "rewards.winners": 0
      })
      .skip(skipIndex)
      .limit(pageSize)
      .get();

    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'lottery-query-page:ok',
      data: {
        currentPage: event.page,
        totalPage: totalPage,
        lotteries: lotteriesRes.data
      }
    };

  } else {

    countRes = await db.collection('lottery').where({
      status: 1,
      type: type
    }).count();

    total = countRes.total;
    if (total === 0) {
      return {
        env: cloud.DYNAMIC_CURRENT_ENV,
        errMsg: 'lottery-query-page:none',
        data: {
          currentPage: 1,
          totalPage: 0
        }
      };
    }
    totalPage = Math.floor((total - 1) / pageSize) + 1;
    if (skipIndex >= total) {
      return {
        env: cloud.DYNAMIC_CURRENT_ENV,
        errMsg: 'lottery-query-page:empty',
        data: {
          currentPage: pageIndex > totalPage ? totalPage : pageIndex,
          totalPage: totalPage
        }
      };
    }

    lotteriesRes = await db.collection('lottery')
      .where({
        status: 1
      })
      .field({
        sponsor: false,
        "condition.type": false,
        "condition.value": false,
        "rewards.winners": 0
      })
      .skip(skipIndex)
      .limit(pageSize)
      .get();
  }

  if (lotteriesRes.errMsg !== 'collection.get:ok') {

    return queryErrorRes;

  }

  return {
    env: cloud.DYNAMIC_CURRENT_ENV,
    errMsg: 'lottery-query-page:ok',
    data: {
      currentPage: event.page,
      totalPage: totalPage,
      lotteries: lotteriesRes.data
    }
  };

}

async function queryLottery(event) {

  let lotteryId = event.lotteryId;
  let lottery = await getLotteryById(lotteryId);

  if (lottery === undefined) {

    // 抽奖不存在
    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'lottery-query:error'
    };

  }

  const {
    OPENID
  } = cloud.getWXContext();

  let participateRes = await db.collection('participate').where({
    openid: OPENID,
    lotteryId: lotteryId
  }).get();

  if (participateRes.errMsg !== 'collection.get:ok') {

    return queryErrorRes;

  }

  let totalParticipateRes = await db.collection('participate')
    .where({
      lotteryId: event.lotteryId
    })
    .count();

  if (totalParticipateRes.errMsg !== 'collection.count:ok') {

    return queryErrorRes;

  }

  let enrollments = totalParticipateRes.total;

  let miss;
  if (lottery.status === -1) {

    miss = true;
    let winners = [];
    lottery.winners.forEach((rewardWinners, rewardIndex) => {

      winners[rewardIndex] = rewardWinners.map(winner => {
        if (winner.openid === OPENID) {
          miss = false;
        }
        let nickName = winner.userInfo.nickName;
        return {
          userInfo: {
            avatarUrl: winner.userInfo.avatarUrl,
            nickName: new Array(nickName.length).join('*') + nickName.substr(-1)
          }
        }
      });

    });

    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'lottery-query:ok',
      data: {
        user: {
          rewardCode: miss ? undefined : (participateRes.data.length === 1 ? participateRes.data[0]._id : undefined),
          participated: participateRes.data.length === 1,
          miss: miss
        },
        lottery: {
          enrollments: enrollments,
          condition: lottery.condition,
          brochures: lottery.brochures,
          share: lottery.share,
          status: lottery.status,
          rewards: lottery.rewards.map(reward => {
            return {
              name: reward.name + '×' + reward.winners
            };
          }),
          sponsor: lottery.sponsor,
          pic: lottery.pic,
          winners: winners
        }
      }
    };

  }

  return {
    env: cloud.DYNAMIC_CURRENT_ENV,
    errMsg: 'lottery-query:ok',
    data: {
      user: {
        participated: participateRes.data.length === 1
      },
      lottery: {
        enrollments: enrollments,
        condition: lottery.condition,
        brochures: lottery.brochures,
        share: lottery.share,
        status: lottery.status,
        rewards: lottery.rewards.map(reward => {
          return {
            name: reward.name + '×' + reward.winners
          };
        }),
        sponsor: lottery.sponsor,
        pic: lottery.pic
      }
    }
  };

}

async function participate(event) {

  const {
    OPENID
  } = cloud.getWXContext();

  let res = await db.collection('user').where({
    openid: OPENID
  }).get();

  if (res.errMsg !== 'collection.get:ok') {

    return participateErrorRes;

  }

  if (res.data.length === 0) {

    // 尚未授权登录
    return unauthorizedErrorRes;

  }

  let lotteryId = event.lotteryId;

  let participateRes = await db.collection('participate').where({
    openid: OPENID,
    lotteryId: lotteryId
  }).get();

  if (participateRes.errMsg !== 'collection.get:ok') {

    return participateErrorRes;

  }

  if (participateRes.data.length === 0) {

    let lottery = await getLotteryById(lotteryId);

    if (lottery === undefined) {

      // 抽奖不存在
      return {
        env: cloud.DYNAMIC_CURRENT_ENV,
        errMsg: 'lottery-participate:error',
        errCode: 10001
      };

    }

    if (lottery.status === -1) {
      // 已开奖
      return {
        env: cloud.DYNAMIC_CURRENT_ENV,
        errMsg: 'lottery-participate:error',
        errCode: 10002
      };
    }

    participateRes = await db.collection('participate').add({
      data: {
        openid: OPENID,
        lotteryId: lotteryId,
        userInfo: res.data[0]['userInfo'],
        participatedTime: new Date()
      }
    });

    if (participateRes.errMsg !== 'collection.add:ok') {

      return participateErrorRes;

    }

    let totalParticipateRes = await db.collection('participate')
      .where({
        lotteryId: event.lotteryId
      })
      .count();

    if (totalParticipateRes.errMsg !== 'collection.count:ok') {

      return participateErrorRes;

    }

    let enrollments = totalParticipateRes.total;

    let winnerOpenids;
    let winners;

    if (lottery.condition.type === 1 && enrollments === lottery.condition.value) {

      // 按人数开奖类型，达到开奖条件，取样中奖者
      let winnerSize = lottery.rewards.map(reward => reward.winners).reduce((previousValue, currentValue) => previousValue + currentValue);
      let winnersRes = await db.collection("participate")
        .aggregate()
        .lookup({
          from: 'user',
          localField: 'openid',
          foreignField: 'openid',
          as: "winners"
        })
        .replaceRoot({
          newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$winners', 0]), '$$ROOT'])
        })
        .project({
          winners: 0,
          authorizedTime: 0,
          participatedTime: 0,
          userInfo: {
            city: 0,
            country: 0,
            gender: 0,
            language: 0,
            province: 0
          }
        })
        .match({
          lotteryId: lotteryId
        })
        .sample({
          size: winnerSize
        })
        .end();

      if (winnersRes.errMsg === 'collection.aggregate:ok' && winnersRes.list.length === winnerSize) {

        winnerOpenids = winnersRes.list.map(winner => winner.openid);

        let addBroadcastTasks = [];
        let addBroadcastTask;
        let rewardWinners = [];
        winners = [];
        lottery.rewards.forEach((reward, rewardIndex) => {

          rewardWinners[rewardIndex] = winnersRes.list.splice(0, reward.winners).map(winner => {
            return {
              openid: winner.openid,
              userInfo: winner.userInfo
            }
          });
          winners[rewardIndex] = rewardWinners[rewardIndex].map(winner => {

            addBroadcastTask = db.collection("broadcast")
              .add({
                data: {
                  broadcastTime: new Date(),
                  reward: reward.name,
                  rewardIndex: rewardIndex,
                  type: 'winner',
                  lotteryId: lotteryId,
                  openid: winner.openid,
                  userInfo: winner.userInfo
                }
              });
            addBroadcastTasks.push(addBroadcastTask);

            let nickName = winner.userInfo.nickName;
            return {
              userInfo: {
                avatarUrl: winner.userInfo.avatarUrl,
                nickName: new Array(nickName.length).join('*') + nickName.substr(-1)
              }
            };

          });

        });

        let updateLotteryRes = await db.collection('lottery').doc(lotteryId).update({
          data: {
            status: -1, // 抽奖状态设置为已开奖
            winners: rewardWinners,
            endTime: new Date()
          }
        });

        if (updateLotteryRes.errMsg !== 'document.update:ok' || updateLotteryRes.stats.updated === 0) {

          // 可能会出现开奖失败的状况
          return participateErrorRes;

        }

        let addBroadcastTasksRes = await Promise.all(addBroadcastTasks);
        console.log(addBroadcastTasksRes);

        let miss = winnerOpenids.indexOf(OPENID) === -1;

        return {
          errMsg: 'lottery.participate:ok',
          data: {
            user: {
              rewardCode: miss ? undefined : participateRes._id,
              miss: miss
            },
            lottery: {
              status: -1,
              enrollments: enrollments,
              winners: winners
            }
          },
          env: cloud.DYNAMIC_CURRENT_ENV
        };

      } else {

        // 抽取中奖用户失败
        return participateErrorRes;

      }

    }

    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'lottery-participate:ok',
      data: {
        lottery: {
          enrollments: enrollments
        }
      }
    };

  }

  return {
    env: cloud.DYNAMIC_CURRENT_ENV,
    errMsg: 'lottery-participate:error',
    errCode: 10003
  };

}

async function queryParticipatedUsers(event) {

  let pageIndex = event.page - 1;
  let pageSize = event.size;
  let skipIndex = pageIndex * pageSize;
  let total;
  let totalPage;

  let countRes = await db.collection('participate')
    .aggregate()
    .lookup({
      from: 'user',
      localField: 'openid',
      foreignField: 'openid',
      as: "users"
    })
    .match({
      lotteryId: event.lotteryId
    })
    .count('total')
    .end();

  if (countRes.list.length === 0) {
    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'query-participated-users-page:none',
      data: {
        total: 0,
        currentPage: 1,
        totalPage: 0
      }
    };
  }

  total = countRes.list[0].total;
  totalPage = Math.floor((total - 1) / pageSize) + 1;

  if (skipIndex >= total) {
    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'query-participated-users-page:empty',
      data: {
        total: total,
        currentPage: pageIndex > totalPage ? totalPage : pageIndex,
        totalPage: totalPage
      }
    };
  }

  let usersRes = await db.collection('participate')
    .aggregate()
    .lookup({
      from: 'user',
      localField: 'openid',
      foreignField: 'openid',
      as: "users"
    })
    .replaceRoot({
      newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$users', 0]), '$$ROOT'])
    })
    .project({
      users: 0,
      authorizedTime: 0,
      openid: 0,
      userInfo: {
        city: 0,
        country: 0,
        gender: 0,
        language: 0,
        nickName: 0,
        province: 0
      }
    })
    .match({
      lotteryId: event.lotteryId
    })
    .sort({
      participatedTime: -1
    })
    .skip(skipIndex)
    .limit(pageSize)
    .end();

  return {
    env: cloud.DYNAMIC_CURRENT_ENV,
    errMsg: 'query-participated-users-page:ok',
    data: {
      total: total,
      currentPage: event.page,
      totalPage: totalPage,
      avatars: usersRes.list.map(user => user.userInfo.avatarUrl)
    }
  };

}

async function getLotteryById(lotteryId) {

  let res = await db.collection('lottery').where({
    _id: lotteryId
  }).get();

  if (res.errMsg !== 'collection.get:ok' || res.data.length === 0) {

    return undefined;

  }

  return res.data[0];

}