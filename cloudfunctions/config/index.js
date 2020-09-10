// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();


// 云函数入口函数
exports.main = async(event, context) => {
  switch (event.action) {
    case "query-config":
      return queryConfig(event);
    case "query-configs":
      return queryConfigs(event);
  }
}

async function queryConfig(event) {

  let res = await db.collection('config').field({
    _id: true,
    value: true
  }).where({
    _id: event.id
  }).get();

  return {
    errMsg: 'config.query:ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      config: res.data
    }
  }

}

async function queryConfigs(event) {

  let configsRes = await db.collection('config').field({
    _id: true,
    value: true
  }).get();

  return {
    errMsg: 'configs.query:ok',
    env: cloud.DYNAMIC_CURRENT_ENV,
    data: {
      configs: configsRes.data
    }
  }

}