// 云函数入口文件
const cloud = require('wx-server-sdk')
const dateUtils = require('date-utils')
const _ = require('underscore')

process.env.TZ ='Asia/Shanghai'
cloud.init({ env: process.env.Env })

const db = cloud.database();

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {


  let dt = new Date();
  // let dt = new Date().addHours(8);
  let time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");
  let today = dt.toFormat("YYYY-MM-DD");

  let res = await db.collection('lottery')
  .aggregate()
  .match({
    status: -1,
    lottery: 0
  })
  .limit(1000)
  .end()

  console.log(res);

  let items = res.list;
  items.forEach(async (element) => {
    console.log(element);
    console.log(element.condition);
    console.log(element.condition.value);
    console.log(new Date(element.condition.value));
    console.log(new Date(element.condition.value).getTime());

    console.log(time);
    console.log(typeof time);
    console.log(new Date(time).getTime());

    let n1 = new Date(time).getTime();
    let n2 = new Date(element.condition.value).getTime();

    let _id = element['_id'];
    let reward = element['rewards'][0];
    let winners = reward['winners'];

    let res2 = await db.collection('participate')
    .aggregate()
    .match({
      lotteryId: _id
    })
    .limit(1000)
    .end()
    
    let items = _.shuffle(res2.list);
    // console.log(items);
    let arr = items.slice(0,winners);
    console.log('抽中名额');
    console.log(arr);
    let rewardWinners = [];
    arr.forEach((item, index)=>{

      rewardWinners.push({
        openid: item.openid,
        userInfo: item.userInfo
      })
      db.collection("broadcast")
      .add({
        data: {
          broadcastTime: new Date(),
          reward: reward.name,
          rewardIndex: index,
          type: 'winner',
          lotteryId: _id,
          openid: item.openid,
          userInfo: item.userInfo
        }
      })
      .then(res=>{
        console.log(res);
  
      })
      .catch(err=>{
        console.log(err);
      });
    })
    let rewardwinner = [];
    rewardwinner[0] = rewardWinners;
    db.collection('lottery').doc(_id).update({
      // data 字段表示需新增的 JSON 数据
      data: {
        lottery: 1,
        winners: rewardwinner,
        endTime: new Date()
      }
    })
    .then(res => {
      console.log(res)
    })
    .catch(err=>{
      console.log(err);
    })
  
    
  });

}