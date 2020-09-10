// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  switch (event.action) {
    case "get-unlimited":
      return getUnlimited(event);
    case "authorize":
      return authorize(event);
  }

}

async function getUnlimited(event) {

  try {

    const wxacodeRes = await cloud.openapi.wxacode.getUnlimited({
      scene: event.scene,
      page: 'pages/index/index'
    });
    const uploadRes = await cloud.uploadFile({
      cloudPath: 'wxacode/' + event.scene + '.jpg',
      fileContent: wxacodeRes.buffer,
    });
    cloud.getTempFileURL({
      fileList: [{
        fileID: uploadRes.fileID,
        maxAge: 60 * 60, // one hour
      }]
    }).then(res => {
      // get temp file URL
      console.log(res.fileList)
    }).catch(error => {
      // handle error
    })
    return uploadRes.fileID;

  } catch (err) {
    return err
  }

}

async function authorize(event) {

  const {
    OPENID
  } = cloud.getWXContext();

  let getRes = await db.collection('wxacode-user').where({
    openid: OPENID
  }).get();

  if (getRes.errMsg !== 'collection.get:ok') {

    return {
      env: cloud.DYNAMIC_CURRENT_ENV
    };

  }

  if (getRes.data.length > 0) {

    return {
      env: cloud.DYNAMIC_CURRENT_ENV
    };

  }

  let addRes = await db.collection('wxacode-user').add({
    data: {
      openid: OPENID,
      userInfo: event.userInfo,
      authorizedTime: new Date(),
    }
  });

  if (addRes.errMsg !== 'collection.add:ok') {

    return {
      env: cloud.DYNAMIC_CURRENT_ENV
    };

  }

  return {
    errMsg: 'user.authorize.ok',
    env: cloud.DYNAMIC_CURRENT_ENV
  };

}