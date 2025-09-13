const {app, BrowserWindow, ipcMain, shell, dialog} = require("electron");
const path = require("path");
const https = require("https");
const { URL } = require("url");

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

ipcMain.handle("quantum-api-request", async (event, { url, method, headers, body }) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
      
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method || 'GET',
        headers: {
          ...headers,
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk.toString();
        });

        res.on('end', () => {
          try {
            const data = responseData ? JSON.parse(responseData) : {};
            resolve({
              status: res.statusCode,
              data: data
            });
          } catch (error) {
            // If JSON parsing fails, return raw data
            resolve({
              status: res.statusCode,
              data: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        resolve({
          status: 0,
          data: { error: error.message }
        });
      });

      // Set timeout
      req.setTimeout(30000, () => {
        req.destroy();
        resolve({
          status: 0,
          data: { error: 'Request timeout' }
        });
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    } catch (error) {
      console.error('URL parsing error:', error);
      resolve({
        status: 0,
        data: { error: error.message }
      });
    }
  });
});