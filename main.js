const {app, BrowserWindow, ipcMain, shell, dialog} = require("electron");
const path = require("path");

let win;

function createWindow() {
    win = new BrowserWindow({
      width: 1280,
      height: 800,
      webPreferences: {
        nodeIntegration: true,      
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js")
      }
    });
  
    win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on("load-step", (event, stepName) => {
  win.webContents.send("load-step-content", stepName);
});

ipcMain.handle("open-external", async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle("open-folder-dialog", async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
    title: "Select a folder to create your virtual environment",
  });

  if (canceled || filePaths.length === 0) {
    return null; 
  }
  return filePaths[0];
});