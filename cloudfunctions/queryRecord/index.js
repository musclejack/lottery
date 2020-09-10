// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()

  let openid = wxContext.OPENID;
  

  let type = event.type;
  let countResult;
  let broadcastResult;
  let participateResult;
  let result;

  let total = 0;
  let data = [];
  

  let items1 = [];
  let items2 = [];
  let arr = [];

  let lotteryResult = await db.collection('lottery')
  .limit(1000)
  .get();


  switch(type){
    case 'awarded-lottery':
      countResult = await db.collection('broadcast').where({
        openid: openid
      }).count();
      total = countResult.total

      broadcastResult = await db.collection('broadcast').where({
        openid: openid
      }).limit(1000).get();


      items1 = lotteryResult.data;
      items2 = broadcastResult.data;
      arr = [];
      items2.forEach(element => {
        arr.push(element.lotteryId);
      });
    
      console.log('items1',items1)
      items1.forEach(element => {
    
        if(arr.indexOf(element._id) != -1 && element.status == 1){
          total++;
          data.push(element);
        }
        
      });

      break;
    case 'waiting-lottery':

        countResult = await db.collection('participate').where({
          openid: openid
        }).count();
        total = countResult.total
  
        participateResult = await db.collection('participate').where({
          openid: openid
        }).limit(1000).get();


        items1 = lotteryResult.data;
        items2 = participateResult.data;
        arr = [];
        items2.forEach(element => {
          arr.push(element.lotteryId);
        });
      
        console.log('items1',items1)
        items1.forEach(element => {
      
          if(arr.indexOf(element._id) != -1 && element.status == 1){
            total++;
            data.push(element);
          }
          
        });

      break;
    case 'total-lottery':

        countResult = await db.collection('participate').where({
          openid: openid
        }).count();
        total = countResult.total
  
        participateResult = await db.collection('participate').where({
          openid: openid
        }).limit(1000).get();


        items1 = lotteryResult.data;
        items2 = participateResult.data;
        arr = [];
        items2.forEach(element => {
          arr.push(element.lotteryId);
        });
      
        console.log('items1',items1)
        items1.forEach(element => {
      
          if(arr.indexOf(element._id) != -1){
            total++;
            data.push(element);
          }
          
        });

      break;
  }



  return {
    total,
    data
  }
}