// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_DEV === 'true';

function createWindow() {
  const appWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  })
  appWindow.loadFile('dist/simuflow/browser/index.html');

  appWindow.on('closed', function () {
    appWindow = null
  })
}

app.whenReady().then(()=>{
  createWindow()
})
