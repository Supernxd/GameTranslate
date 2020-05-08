const crypto = require('crypto')
const rp = require('request-promise');

// 百度翻译
const translate_apiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate' // 百度翻译通用地址
const translate_appid = '20200508000444343'
const translate_secretKey = '8KyQmAQaxr58YUxI73jU'

// 百度OCR
const ocr_apiUrl = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic' // 百度AI文字识别地址
const ocr_api_key = 'CRLXddfUdMc3Fb4BU1rphFFS'
const ocr_secret_key = 'ylqwp32oj9izS2ikA4GAUydgHtL62uFl '
let token = {
  access_token : "",
  timeStamp:""
}

/**
 * 百度翻译
 * q 待翻译文字
 * cb 回调
 **/ 
const translate = (q, cb) => {
  const salt = Date.now()
  const sign = MD5(translate_appid+q+salt+translate_secretKey).toLowerCase()
  const query = `${translate_apiUrl}?q=${q}&from=auto&to=zh&appid=${translate_appid}&salt=${salt}&sign=${sign}` 
  rp(query).then((htmlString) => {
    const result = JSON.parse(htmlString)
    if (result.error_code)
      return cb('获取翻译结果失败:'+result.error_code)
    cb(null, result.trans_result[0].dst.toString())
  })
  .catch((err) => {
    console.log(err)
    return cb('翻译失败')
  });
} 

/**
 * 图片文字识别
 * p 图片base64
 * cb 回调
 **/ 
const capture = (p, cb) => {
  getToken((err, token) => {
    if (err) return cb('token获取失败')
    const option = {
      ...defaultOptions,
      url: `${ocr_apiUrl}?access_token=${token.access_token}`,
      form: {
        image: p
      }
    }
    rp(option).then((resData) => {
      const { words_result_num, words_result } = resData
      let str = ''
      if(words_result_num > 0) {
        words_result.map(item => {
          str += item.words + ' '
        })
      }
      return cb(null, str)
    }).catch((err) => {
        console.log(err)
        return cb('获取图片文字失败')
    });
  })
}

const MD5 = (str) => {
  const hash = crypto.createHash('MD5');
  return hash.update(str).digest('hex')
}


// rp
const defaultOptions = {
  method: 'POST'
  ,headers: {
    'content-type': 'application/x-www-form-urlencoded'
  }
  ,json: true
}

const getToken = (cb) => {
  if(!token.access_token || !token.timeStamp || token.timeStamp < new Date().getTime()){
    const option = {
      ...defaultOptions,
      url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${ocr_api_key}&client_secret=${ocr_secret_key}`
    }
    rp(option).then((resData) => {
      token.access_token = resData.access_token
      token.timeStamp = Number(resData.expires_in) * 1000 + Number(new Date().getTime())
      return cb(null, token)
    }).catch((err) => {
      console.log(err)
      return cb('获取失败')
    });
  }else{
    cb(null, token)
  }
}

module.exports = {
  translate,
  capture
}


if(require.main === module) {
  // translate('apple is mine', (err, str) => {
  //   console.log(err, str)
  // })
  // getToken((err, ret) => {
  //   console.log(err, ret)
  // })  
  const fs = require('fs')
  let data = fs.readFileSync(__dirname + '/test.jpg');
  data = Buffer.from(data).toString('base64');
  capture(data,(err, ret) => {
    if(err) return console.log('失败')
    translate(ret, (err, str) => {
      console.log(err, str)
    })
  })
}