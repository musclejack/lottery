const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {

  let res = await db.collection('lottery')
  .aggregate()
  .match({
    status: -1,
    lottery: 1,
    send: 0
  })
  .limit(1000)
  .end()

  console.log(res);

  let items = res.list;
  items.forEach(async (element) => {
    console.log(element);
    let lottery = element['_id'];
    let time = element['condition']['value'];
    let title = element['rewards'][0]['name'];

    let res2 = await db.collection('participate')
    .aggregate()
    .match({
      lotteryId: lottery
    })
    .limit(1000)
    .end()

    // console.log(res2);

    let lists = res2.list;
    lists.forEach(async (part) => {
      console.log(part);
      
      let openid = part['openid'];
      const result = await cloud.openapi.subscribeMessage.send({
        touser: openid,
        page: '/pages/participate/index?lotteryId='+lottery,
        data: {
          thing1: {
            value: title
          },
          time3: {
            value: time
          },
          thing5: {
            value: '请进入小程序查询'
          }
        },
        templateId: 'RJ6Wn2j52vZ7R06w-D-N7Mlw8W2DmnQ4sORsaJSeiAA'
      })
      console.log(result)
    })
    

    db.collection('lottery').doc(lottery).update({
      // data 字段表示需新增的 JSON 数据
      data: {
        send: 1
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