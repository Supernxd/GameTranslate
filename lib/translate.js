const c_t = require('./thirdParty/baidu')

//TODO 获取图片

//TODO 图片传入至百度 获取返回文字

//TODO 文字传入百度 进行翻译

const getTranslateByPic = (data) => {
  c_t.capture(data,(err, ret) => {
    if(err) return console.log('失败')
    c_t.translate(ret, (err, str) => {
      console.log(err, str)
    })
  })
}


