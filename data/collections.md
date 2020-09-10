- 需要运行起来，还需要在微信开发工具，创建好以下数据库集合：

1. broadcast 广播表
1. lottery 抽奖表
1. participate 抽奖参与表
1. subscribe 订阅消息表
1. user 用户表
1. config 配置表

 **创建好之后，只需要把抽奖表插入一个测试数据即可** 
 
```
{
  "pic": "cloud://prod-env-cqt7c.7072-prod-env-cqt7c-1301932434/reward/redpack.png", // 这是我云存储的资源，需要换成你自己的
  "condition": {
    "type": 1, // 抽奖类型，1代表满人开奖，2代表按时间自动开奖
    "description": "满2人自动开奖",
    "value": 2 // 开奖条件的值，type为1时代表满多少人开奖
  },
  "status": 1, // 抽奖状态 1代表未开奖、-1代表已开奖
  "sponsor": { // 赞助商信息
    "name": "照片精选", // 赞助商信息
    "description": "精选照片、明星照片、艺术照片、风景照片、名车照片", // 赞助商信息
    "avatar": "cloud://prod-env-cqt7c.7072-prod-env-cqt7c-1301932434/sponsor/gh_597e98070614_258.jpg", // 这是我云存储的资源，需要换成你自己的
    "appId": "wx14032d78e965211a" // 跳转appId
  },
  "rewards": [{ "name": "2元现金红包", "winners": 1 },{ "name": "1元现金红包", "winners": 1 }], // 抽奖奖品
  "type": 0, // 这个忘了什么用的了，目前好像没用到
  "value": 3, // 奖品的价值
  "share": { // 分享配置数据
    "imageUrl": "cloud://prod-env-cqt7c.7072-prod-env-cqt7c-1301932434/reward/redpack-share.jpg" // 这是我云存储的资源，需要换成你自己的
  },
  "display": 1 // 是否是公共抽奖，0代表否，1代表是（公共抽奖是大厅能看到的，私有抽奖只能通过分享转发给别人抽奖）
}
```

