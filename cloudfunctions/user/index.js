// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const command = db.command;
const aggregate = db.command.aggregate;

const errorQueryRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'user.query:error'
};

const errorAuthorizeRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'user.authorize:error'
};

const authorizedRes = {
  env: cloud.DYNAMIC_CURRENT_ENV,
  errMsg: 'user.authorize:authorized'
};

// 云函数入口函数
exports.main = async (event, context) => {

  switch (event.action) {
    case "query-current-user":
      return queryCurrentUser(event);
    case "authorize":
      return authorize(event);
    case "query-lotteries":
      return queryLotteries(event);
    case "query-lottery-records":
      return queryLotteryRecords(event);
    case "query-lottery-record-counts":
      return queryLotteryRecordCounts(event);
  }

}

async function queryCurrentUser(event) {

  const {
    OPENID
  } = cloud.getWXContext();

  let res = await db.collection('user').where({
    openid: OPENID
  }).field({
    _id: 0,
    authorizedTime: 0
  }).get();

  if (res.errMsg !== 'collection.get:ok') {

    return errorQueryRes;

  }

  if (res.data.length === 0) {

    return {
      errMsg: 'user.query.none',
      env: cloud.DYNAMIC_CURRENT_ENV
    };

  }

  return {
    errMsg: 'user.query.ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      userInfo: res.data[0].userInfo
    }
  };

}

async function authorize(event) {

  const {
    OPENID
  } = cloud.getWXContext();

  let getRes = await db.collection('user').where({
    openid: OPENID
  }).get();

  if (getRes.errMsg !== 'collection.get:ok') {

    return errorAuthorizeRes;

  }

  if (getRes.data.length > 0) {

    return authorizedRes;

  }

  let addRes = await db.collection('user').add({
    data: {
      openid: OPENID,
      userInfo: event.userInfo,
      authorizedTime: new Date(),
    }
  });

  if (addRes.errMsg !== 'collection.add:ok') {

    return errorAuthorizeRes;

  }

  return {
    errMsg: 'user.authorize.ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      userInfo: event.userInfo
    }
  };

}

async function queryLotteries(event) {

  const {
    OPENID
  } = cloud.getWXContext();

  let pageIndex = event.page - 1;
  let pageSize = event.size;
  let skipIndex = pageIndex * pageSize;
  let total;
  let totalPage;

  let countRes = await db.collection("lottery")
    .aggregate()
    .lookup({
      from: 'participate',
      localField: '_id',
      foreignField: 'lotteryId',
      as: "participates"
    })
    .project({
      status: 1,
      display: 1,
      condition: {
        description: 1
      },
      rewards: 1,
      pic: 1,
      value: 1,
      participate: aggregate.filter({
        input: '$participates',
        as: 'participate',
        cond: aggregate.eq(['$$participate.openid', OPENID])
      })
    })
    .project({
      participate: {
        openid: 0,
        lotteryId: 0
      }
    })
    .replaceRoot({
      newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$participate', 0]), '$$ROOT'])
    })
    .project({
      status: 1,
      display: 1,
      condition: {
        description: 1
      },
      rewards: 1,
      pic: 1,
      value: 1,
      participatedTime: aggregate.ifNull(['$participatedTime', null])
    })
    .addFields({
      visible: aggregate.or([aggregate.eq(['$display', 1]), aggregate.neq(['$participatedTime', null])])
    })
    .project({
      participate: 0,
      participates: 0
    })
    .match({
      status: 1,
      visible: true
    })
    .project({
      status: 0,
      display: 0,
      visible: 0
    })
    .count("total")
    .end();

  if (countRes.list.length === 0) {
    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'query-lotteries-page:none',
      data: {
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
      errMsg: 'query-lotteries-page:empty',
      data: {
        currentPage: pageIndex > totalPage ? totalPage : pageIndex,
        totalPage: totalPage
      }
    };
  }

  let lotteriesRes = await db.collection("lottery")
    .aggregate()
    .lookup({
      from: 'participate',
      localField: '_id',
      foreignField: 'lotteryId',
      as: "participates"
    })
    .project({
      status: 1,
      display: 1,
      condition: {
        description: 1
      },
      rewards: 1,
      pic: 1,
      value: 1,
      participate: aggregate.filter({
        input: '$participates',
        as: 'participate',
        cond: aggregate.eq(['$$participate.openid', OPENID])
      })
    })
    .project({
      participate: {
        openid: 0,
        lotteryId: 0
      }
    })
    .replaceRoot({
      newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$participate', 0]), '$$ROOT'])
    })
    .project({
      status: 1,
      display: 1,
      condition: {
        description: 1
      },
      rewards: 1,
      pic: 1,
      value: 1,
      participatedTime: aggregate.ifNull(['$participatedTime', null])
    })
    .addFields({
      visible: aggregate.or([aggregate.eq(['$display', 1]), aggregate.neq(['$participatedTime', null])])
    })
    .project({
      participate: 0,
      participates: 0
    })
    .match({
      status: 1,
      visible: true
    })
    .project({
      status: 0,
      display: 0,
      visible: 0
    })
    .skip(skipIndex)
    .limit(pageSize)
    .end();

  return {
    errMsg: 'query-lotteries-page:ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      currentPage: event.page,
      totalPage: totalPage,
      lotteries: lotteriesRes.list
    }
  };

}

async function queryLotteryRecords(event) {

  const {
    OPENID
  } = cloud.getWXContext();

  let recordType = event.type;
  let pageIndex = event.page - 1;
  let pageSize = event.size;
  let skipIndex = pageIndex * pageSize;
  let total;
  let totalPage;
  let countRes;

  let countAggregate = db.collection("participate")
    .aggregate()
    .lookup({
      from: 'lottery',
      localField: 'lotteryId',
      foreignField: '_id',
      as: "lotteries"
    })
    .replaceRoot({
      newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$lotteries', 0]), '$$ROOT'])
    });

  switch (recordType) {
    case 'awarded-lottery':
      countRes = await countAggregate
        .unwind('$winners')
        .match({
          status: -1,
          'winners.openid': OPENID
        })
        .count('count')
        .end();
      break;
    case 'waiting-lottery':
      countRes = await countAggregate
        .match({
          status: 1,
          openid: OPENID
        })
        .count('count')
        .end();
      break;
    case 'total-lottery':
      countRes = await countAggregate
        .match({
          openid: OPENID
        })
        .count('count')
        .end();
      break;
  }

  if (countRes.list.length === 0) {
    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'lottery-record-page:none',
      data: {
        currentPage: 1,
        totalPage: 0
      }
    };
  }

  total = countRes.list[0].count;
  totalPage = Math.floor((total - 1) / pageSize) + 1;

  if (skipIndex >= total) {
    return {
      env: cloud.DYNAMIC_CURRENT_ENV,
      errMsg: 'lottery-record-page:empty',
      data: {
        total: total,
        currentPage: pageIndex > totalPage ? totalPage : pageIndex,
        totalPage: totalPage
      }
    };
  }

  let recordAggregate = db.collection("participate")
    .aggregate()
    .lookup({
      from: 'lottery',
      localField: 'lotteryId',
      foreignField: '_id',
      as: "lotteries"
    })
    .replaceRoot({
      newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$lotteries', 0]), '$$ROOT'])
    })
    .project({
      condition: {
        type: 0,
        value: 0
      },
      lotteries: 0,
      endTime: 0,
      sponsor: 0,
      value: 0,
      type: 0,
      winners: {
        userInfo: 0
      }
    });

  let recordRes;
  switch (recordType) {
    case 'awarded-lottery':
      recordRes = await recordAggregate
        .unwind('$winners')
        .match({
          status: -1,
          'winners.openid': OPENID
        })
        .skip(skipIndex)
        .limit(pageSize)
        .sort({
          "status": -1,
          "participatedTime": -1,
          "endTime": -1
        })
        .end();
      break;
    case 'waiting-lottery':
      recordRes = await recordAggregate
        .match({
          status: 1,
          openid: OPENID
        })
        .skip(skipIndex)
        .limit(pageSize)
        .sort({
          "status": -1,
          "participatedTime": -1,
          "endTime": -1
        })
        .end();
      break;
    case 'total-lottery':
      recordRes = await recordAggregate
        .match({
          openid: OPENID
        })
        .skip(skipIndex)
        .limit(pageSize)
        .sort({
          "status": -1,
          "participatedTime": -1,
          "endTime": -1
        })
        .end();
      break;
  }

  return {
    errMsg: 'lottery-record-page:ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      total: total,
      currentPage: event.page < totalPage ? event.page : totalPage,
      totalPage: totalPage,
      records: recordRes.list
    }
  };

}

async function queryLotteryRecordCounts() {

  const {
    OPENID
  } = cloud.getWXContext();

  let recordTypeCounts = {
    'awarded-lottery': 0,
    'waiting-lottery': 0,
    'total-lottery': 0
  }

  let countRes;
  for (let recordType in recordTypeCounts) {

    let count = 0;
    switch (recordType) {
      case 'awarded-lottery':
        countRes = await db.collection("participate")
          .aggregate()
          .lookup({
            from: 'lottery',
            localField: 'lotteryId',
            foreignField: '_id',
            as: "lotteries"
          })
          .replaceRoot({
            newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$lotteries', 0]), '$$ROOT'])
          })
          .unwind('$winners')
          .match({
            status: -1,
            'winners.openid': OPENID
          })
          .count('count')
          .end();
        count = countRes.list.length === 0 ? 0 : countRes.list[0].count;
        break;
      case 'waiting-lottery':
        countRes = await db.collection("participate")
          .aggregate()
          .lookup({
            from: 'lottery',
            localField: 'lotteryId',
            foreignField: '_id',
            as: "lotteries"
          })
          .replaceRoot({
            newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$lotteries', 0]), '$$ROOT'])
          })
          .match({
            status: 1,
            openid: OPENID
          })
          .count('count')
          .end();
        count = countRes.list.length === 0 ? 0 : countRes.list[0].count;
        break;
      case 'total-lottery':
        countRes = await db.collection("participate")
          .aggregate()
          .lookup({
            from: 'lottery',
            localField: 'lotteryId',
            foreignField: '_id',
            as: "lotteries"
          })
          .replaceRoot({
            newRoot: aggregate.mergeObjects([aggregate.arrayElemAt(['$lotteries', 0]), '$$ROOT'])
          })
          .match({
            openid: OPENID
          })
          .count('count')
          .end();
        count = countRes.list.length === 0 ? 0 : countRes.list[0].count;
        break;

    }

    recordTypeCounts[recordType] = count;
  }

  return {
    errMsg: 'query-lottery-record-counts:ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      counts: recordTypeCounts
    }
  };

}