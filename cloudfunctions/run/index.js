// 云函数入口文件
const cloud = require('wx-server-sdk')
const dateUtils = require('date-utils')

process.env.TZ ='Asia/Shanghai'
cloud.init({ env: process.env.Env })

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {


  let dt = new Date();
  // let dt = new Date().addHours(8);
  let time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");
  let today = dt.toFormat("YYYY-MM-DD");

  let res = await db.collection('lottery')
  .aggregate()
  .match({
    status: 1
  })
  .limit(1000)
  .end()

  // console.log(res);

  let items = res.list;
  items.forEach(element => {
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

    if(n1 > n2){
      let _id = element['_id'];
      db.collection('lottery').doc(_id).update({
        // data 字段表示需新增的 JSON 数据
        data: {
          status: -1
        }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err=>{
        console.log(err);
      })
    }
  
    
  });

}