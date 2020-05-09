const {app,BrowserWindow,screen,globalShortcut} = require('electron');
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
    desktopCapture()
  })

  if (!ret) {
    console.log('registration failed')
  }
  
  win.webContents.openDevTools()
}
function desktopCapture() {
  let size = screen.getPrimaryDisplay().workAreaSize
  let newwin = new BrowserWindow({
    // width: 600,
    // height: 600,
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

  newwin.on('close', () => { newwin = null })
  newwin.on('resize', updateReply)
  newwin.on('move', updateReply)
  newwin.loadURL(`file://${__dirname}/test.html`)
  newwin.show()
  newwin.webContents.openDevTools()
  function updateReply () {
    console.log(`大小: ${newwin.getSize()} 位置: ${newwin.getPosition()}`)
  }
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