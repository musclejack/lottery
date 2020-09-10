const configs = {
  lottery: {
    prod: {
      env: 'lottery-1pa6r', // 抽奖精选 wxb53ba1bee1a3319a
      traceUser: true
    }
  }
}

module.exports = {
  config: configs.lottery.prod
}