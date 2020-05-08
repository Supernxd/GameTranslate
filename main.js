const {app,BrowserWindow,ipcMain} = require('electron');
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
  win.loadURL(`file://${__dirname}/index.html`);//关联的页面文件
  //开启调试工具
  win.webContents.openDevTools();
  win.on('close', () => {
    //回收BrowserWindow对象
    win = null;
  });
  win.on('resize', () => {
    // win.reload();
  })
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