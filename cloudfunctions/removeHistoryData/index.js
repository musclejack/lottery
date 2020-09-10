// 云函数入口文件
// 云函数入口文件
const cloud = require('wx-server-sdk')
const dateUtils = require('date-utils')

process.env.TZ ='Asia/Shanghai'
cloud.init({ env: process.env.Env })

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {


  // let dt = new Date();
  let dt = new Date().addHours(-72);
  let time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");
  console.log('time',time);

  // let time = '2020-07-25 00:00:00';
  let today = dt.toFormat("YYYY-MM-DD");

  let res = await db.collection('lottery')
  .aggregate()
  .match({
    status: -1,
    lottery: 1
  })
  .limit(1000)
  .end()

  // console.log(res);

  let items = res.list;
  items.forEach(element => {

    let n1 = new Date(time).getTime();
    let n2 = new Date(element.condition.value).getTime();

    if(n1 > n2){
      let _id = element['_id'];
      console.log(_id);
      console.log(element.condition.value);

      db.collection('lottery').doc(_id)
      .remove()

      db.collection('participate').where({
        lotteryId: _id
      })
      .remove()
    }
  
    
  });

}