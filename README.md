## 项目介绍

基于云开发的抽奖助手小程序

## 技术支持

小程序搭建过程中，如果遇到问题，请联系开发者微信，微信xfy6369


## 联系
    如需帮助请联系我微信
http://file.xiaomutong.com.cn/img2020061103.jpg


![](https://images.gitee.com/uploads/images/2020/0803/224209_de670646_1307964.jpeg)

微信：xfy6369

## 更新记录
+ 新增按日期自动开奖

## 扫码体验

请具体扫描下放小程序 码进行体验
 ![]( https://s1.ax1x.com/2020/08/13/az8v8S.jpg )

## 更新记录

2020-07-20

重写了核心逻辑

①开奖逻辑

②抽奖逻辑

开奖逻辑目前是按照时间维度，到了时间不管人数有没有凑够都会进行开奖，开奖五分钟后，进行抽奖，确定中奖名额。

2020-08-05

重写了首页逻辑

①抽奖记录上下滑动

②奖项列表

2020-08-15

1、优化了抽奖详情模块

2、抽奖数据结构新增了num，用来记录参与抽奖的人数


## 具体规则

（1）每个整点的1分去检测，根据当前时间检测是否有需要开奖的

（2）每个整点的5分去检测，是否有开奖未抽奖的，如果有，确定中奖名额

## 如何部署

    https://developers.weixin.qq.com/community/develop/article/doc/0002846854056847b66a2d13451013

https://developers.weixin.qq.com/community/develop/article/doc/0002846854056847b66a2d13451013



- 需要运行起来，还需要在微信开发工具，创建好以下数据库集合：

1. broadcast 广播表
1. lottery 抽奖表
1. participate 抽奖参与表
1. subscribe 订阅消息表
1. user 用户表
1. config 集合

 **创建好之后，只需要把抽奖表插入一个测试数据即可** 

```
{
  "pic": "cloud://prod-env-cqt7c.7072-prod-env-cqt7c-1301932434/reward/redpack.png", // 这是我云存储的资源，需要换成你自己的
  "condition": {
    "type": 1, // 抽奖类型，1代表满人开奖，2代表按时间自动开奖
    "description": "满2人自动开奖",
    "value": 2 // 开奖条件的值，type为1时代表满多少人开奖
  },
  "lottery": 0, //0代表未开奖；1代表已开奖，由云函数draw执行
  "status": 1, // 抽奖状态 1代表未开奖、-1代表已开奖，由云函数run执行
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


## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

