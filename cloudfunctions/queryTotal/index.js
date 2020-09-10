// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let openid = wxContext.OPENID;
  
  let countResult;

  countResult = await db.collection('broadcast').where({
    openid: openid
  }).count();
  const total1 = countResult.total

  countResult = await db.collection('participate').where({
    openid: openid
  }).count();
  const total3= countResult.total


  let lotteryResult = await db.collection('lottery')
  .where({
    status: 1
  })
  .limit(100)
  .get();

  let participateResult = await db.collection('participate')
  .where({
    openid: openid
  })
  .limit(1000)
  .get()

  console.log('lotteryResult',lotteryResult);
  console.log('participateResult',participateResult);
  
  let items1 = lotteryResult.data;
  let items2 = participateResult.data;
  let arr = [];
  items2.forEach(element => {
    arr.push(element.lotteryId);
  });

  let total2 = 0;
  console.log('items1',items1)
  items1.forEach(element => {

    if(arr.indexOf(element._id) != -1 && element.status == 1){
      total2++;
    }
    
  });


  return {
    total1,
    total2,
    total3
  }
}