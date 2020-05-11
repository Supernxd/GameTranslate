const {app,BrowserWindow,ipcMain,globalShortcut,Tray,Menu} = require('electron');
const path = require('path')
const {translate} = require('./lib/translate')

let win;
let windowConfig = {
  width: 750,
  height: 712,
  webPreferences: {
    javascript: true,
    plugins: true,
    nodeIntegration: true, // 是否集成 Nodejs
    webSecurity: false,
  }
};

let isCapture = false

function createWindow() {
  win = new BrowserWindow(windowConfig);
  
  win.loadURL(`file://${__dirname}/index.html`)
  
  win.on('close', () => {
    //回收BrowserWindow对象
    win = null;
  });
  win.on('resize', () => {
    // win.reload();
  })
  const ret = globalShortcut.register('CommandOrControl+Alt+A', () => {
    if (isCapture) return
    isCapture = true
    desktopCapture()
  })  

  if (!ret) {
    console.log('registration failed')
  }
  
  makeTray()
}
function desktopCapture() {
  let newwin = new BrowserWindow({
    frame: false,
    titleBarStyle: 'hidden',
    transparent: true,
    fullscreen: true,
    webPreferences: {
    javascript: true,
    plugins: true,
    nodeIntegration: true, // 是否集成 Nodejs
    webSecurity: false,
  }})

  globalShortcut.register('ESC', () => {
    newwin.close()
  })

  newwin.on('close', () => { 
    console.log('close')
    newwin = null; 
    isCapture = false
    globalShortcut.unregister('ESC')
    ipcMain.removeListener('closeCapturehtml')
  })
  ipcMain.once('closeCapturehtml', () => {
    newwin.close()
  })
  newwin.loadURL(`file://${__dirname}/test.html`)
  newwin.show()
  // newwin.webContents.openDevTools()
}

ipcMain.on('translate', async (event, arg) => {
  let msg = ''
  try {
    msg = await translate(arg)
  } catch (error) {
    msg = '失败'
  }
  event.sender.send('translate_reply', msg)
})

const makeTray = () => {
  const iconPath = path.join(__dirname, 'windows-icon.png')
  appIcon = new Tray(iconPath)

  const contextMenu = Menu.buildFromTemplate([{
    label: '移除',
    click: () => {
      event.sender.send('tray-removed')
    }
  }])

  appIcon.setToolTip('在托盘中的 Electron 示例.')
  appIcon.setContextMenu(contextMenu)
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  app.quit();
});
app.on('activate', () => {
  if (win == null) {
    createWindow();
  }
})