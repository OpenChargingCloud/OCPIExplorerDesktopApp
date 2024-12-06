// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path       = require('path')


let mainWindow;

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width:  1700,
    height:  900,
    autoHideMenuBar:    true,
    webPreferences: {
      //preload:           path.join(__dirname, 'preload.cjs'),
      nodeIntegration:          true,
      nodeIntegrationInWorker:  true,
      contextIsolation:         false,
      enableRemoteModule:       true
    }

    //icon:               `${app.getAppPath()}/src/icons/ocpiExplorer_icon.png`,

  })

  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')
  mainWindow.loadURL(`file://${app.getAppPath()}/src/index.html`);

  if (app.commandLine.hasSwitch('inspect'))
      mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow()
  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('send-WSTextMessage', (event, { clientId, message }) => {


});

ipcMain.on('getCLIParameters', (event) => {
   event.returnValue = {
      ocpiVersionsURL:        app.commandLine.getSwitchValue('url'),
      ocpiAccessToken:        app.commandLine.getSwitchValue('token'),
      ocpiAccessTokenBase64:  app.commandLine.getSwitchValue('base64')
   };
});
