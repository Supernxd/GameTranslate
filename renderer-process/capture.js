const {desktopCapturer, webFrame, shell} = require('electron')
const fs = require('fs')
const os = require('os')
const path = require('path')

let canSelect = false,
  isSelect = false,
  startPos, endPos, srcCtx
webFrame.setZoomFactor(1.0);

const getDesktopPic = () => {
  console.log('正在截取屏幕...')
  console.log(desktopCapturer.getSources)
  let options = { types: ['screen']}
  desktopCapturer.getSources({types: ['screen', 'window']}).then(sources => {
    // if (error) return console.log(error)
    console.log('getSources', sources)
    sources.forEach((source) => {
      if (source.name === 'Entire Screen') {        
        navigator.getUserMedia({
          audio: false,
          video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id + '',
              },
          },
        }, handleStream, handleError)

        // fs.writeFile(screenshotPath, source.thumbnail.toPNG(), (error) => {
        //   if (error) return console.log(error)
        //   shell.openExternal(`file://${screenshotPath}`)

        //   console.log(`截图保存到: ${screenshotPath}`)
        // })
      }
    })
  })
  .catch(err => {
    console.log(err)
  })
}

const handleError = (err) => {
  console.log(err)
}

const handleStream = (stream) => {
  // document.body.style.cursor = oldCursor
  // document.body.style.opacity = '1'
  // Create hidden video tag
  let video = document.createElement('video')
  video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'
  // Event connected to stream
  console.log(stream)
  let loaded = false
  let canvas = document.createElement('canvas')
  video.onloadedmetadata = () => {
    // if (loaded) {
    //     return
    // }
    // loaded = true
    // Set video ORIGINAL height (screenshot)
    video.play()
    video.style.height = window.innerHeight+ 'px' // videoHeight
    video.style.width = window.innerWidth + 'px' // videoWidth

    // Create canvas
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    srcCtx = canvas.getContext('2d')

    // Draw video on canvas
    srcCtx.clearRect(0,0,canvas.width,canvas.height);  
    srcCtx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canSelect = true
    
    if (this.callback) {
        // Save screenshot to png - base64
        
        this.callback(canvas.toDataURL('image/png'))
    } else {
        console.log('Need callback!')
    }

    // Remove hidden video tag
    video.remove()
    try {
      stream.getTracks()[0].stop()
    } catch (e) {
      // nothing
    }
  }
  document.body.appendChild(canvas)
  video.srcObject = stream
  document.body.appendChild(video)
}     
const selectImg = () => {
  const width = (endPos.x - startPos.x)
  const height = (endPos.y - startPos.y)
  let canvas = document.getElementById('pic')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  let ctx = canvas.getContext('2d')
  ctx.clearRect(0,0,canvas.width,canvas.height);  
  ctx.drawImage(srcCtx.canvas, startPos.x , startPos.y, width, height, startPos.x , startPos.y, width, height)
}

document.body.addEventListener('mousedown', (event) => {
  if (event.button == 0){
    isSelect = true
    startPos = {
      x: event.pageX,
      y: event.pageY
    }
  }
})

document.body.addEventListener('mousemove', (event) => {
  if(canSelect && isSelect) {
    endPos = {
      x: event.pageX,
      y: event.pageY
    }
    // selectImg()
  }
})

document.body.addEventListener('mouseup', (event) => {
  if (event.button == 0) {
    isSelect = false
    if (canSelect) {
      // canSelect = false
      endPos = {
        x: event.pageX,
        y: event.pageY
      }
      selectImg()
    }
  }
})

getDesktopPic()