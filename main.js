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
  
  win.webContents.openDevTools()
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
    newwin = null; 
    isCapture = false
    globalShortcut.unregister('ESC')
  })
  newwin.loadURL(`file://${__dirname}/test.html`)
  newwin.show()
  // newwin.webContents.openDevTools()
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