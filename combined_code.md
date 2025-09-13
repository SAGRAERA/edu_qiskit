# Combined JavaScript and HTML Code

## customAPI.js

```js
export class QuantumAPI {
  constructor() {
    this.baseUrl = "https://api.quantum-computing.ibm.com/runtime";
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  _checkToken() {
    if (!this.token) {
      throw new Error("No token set. Please insert Token first");
    }
  }

  async _fetch(path) {
    this._checkToken();
    const url = `${this.baseUrl}/${path}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  }

  async getUsage() {
    return this._fetch("usage");
  }

  async getUser() {
    return this._fetch("users/me");
  }

  async getBackends() {
    return this._fetch("backends");
  }

  async getBackendsStatus(backendID) {
    return this._fetch(`backends/${backendID}/status`);
  }

  async getInfo() {
    const [userData, usageData, backendsData] = await Promise.all([
      this.getUser(),
      this.getUsage(),
      this.getBackends(),
    ]);

    const uniqueDevices = Array.from(new Set(backendsData.devices || []));

    const statusPromises = uniqueDevices.map(async (deviceID) => {
      const status = await this.getBackendsStatus(deviceID);
      return {
        deviceID,
        ...status,
      };
    });

    const devicesWithStatus = await Promise.all(statusPromises);

    return {
      UserInfo: userData,
      Usages: usageData,
      Backends: { devices: devicesWithStatus },
    };
  }
}

```

## examples\ex_BasicsQI.js

```js
export default function renderBasicsQIExample() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const tutorialUrl =
    "https://learning.quantum.ibm.com/course/basics-of-quantum-information";

  mainContent.innerHTML = `
    <h1>Basics of Quantum Information</h1>
    <p>
      This example provides a link to an external tutorial about quantum information basics.
      Click the button below to open the tutorial.
    </p>
    <button id="open-qi-link">Open Tutorial</button>
  `;

  const openQiLinkBtn = document.getElementById("open-qi-link");

  openQiLinkBtn.addEventListener("click", () => {
    window.api.openExternalLink(tutorialUrl);
  });
}

```

## func\index.js

```js
const PythonChecker = require("./pythonChecker");
const { QiskitInstaller } = require("./qiskitInstaller");
const VEnvSetup = require("./venvSetup");
const VSCodeChecker = require("./vsCodeChecker");

module.exports = {
  PythonChecker,
  VEnvSetup,
  VSCodeChecker,
  QiskitInstaller,
};

```

## func\pythonChecker.js

```js
const { exec } = require("child_process");

class PythonChecker {
    constructor() {
        this.pythonInstalled = false;
        this.pythonVersion = null;
    }

    checkPythonInstalled() {
        return new Promise((resolve) => {
            exec("python --version", (error, stdout, stderr) => {
                if (!error) {
                    this.pythonInstalled = true;
                    this.pythonVersion = stdout.trim();
                    resolve(
                        {
                            installed: true,
                            version: stdout.trim()
                        }
                    )
                } else {
                    this.pythonInstalled = false;
                    this.pythonVersion = null;
                    resolve(
                        {
                            installed: false,
                            version: null
                        }
                    )
                }
            });
        })
        
    }

}

module.exports = PythonChecker;
```

## func\qiskitInstaller.js

```js
const { exec } = require("child_process");
const path = require("path");
const os = require("os");

class QiskitInstaller {
  async installQiskit(venvPath = "./venv") {
    return new Promise((resolve, reject) => {
      let pipPath;

      if (os.platform() === "win32") {
        pipPath = path.join(venvPath, "Scripts", "pip.exe");
      } else {
        pipPath = path.join(venvPath, "bin", "pip");
      }

      exec(`"${pipPath}" install qiskit==1.4.2`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

module.exports = { QiskitInstaller };

```

## func\venvSetup.js

```js
const { exec } = require("child_process");

class VEnvSetup {
  constructor() {
    this.venvPath = null;
  }

  createVEnv(folderName = "venv") {
    return new Promise((resolve, reject) => {
      exec(`python -m venv ${folderName}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }
}

module.exports = VEnvSetup;

```

## func\vsCodeChecker.js

```js
const { exec } = require("child_process");

class VSCodeChecker {
    async checkVSCodeInstalled() {
        return new Promise((resolve, reject) => {
            exec ("code --version", (error, stdout, stderr) => {
                if (error) {
                    resolve({ installed: false });
                } else {
                    const versionInfo = stdout.split("\n")[0].trim();
                    resolve({ installed: true, version: versionInfo});
                }
            })
        })
    }
}

module.exports = VSCodeChecker;
```

## index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="./style/global.css" />
    <!-- Contents -->
    <script type="module" src="./renderer.js"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>

```

## main.js

```js
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
```

## preload.js

```js
const { contextBridge, ipcRenderer } = require("electron");
const {
  PythonChecker,
  VEnvSetup,
  VSCodeChecker,
  QiskitInstaller,
} = require("./func");

const pythonChecker = new PythonChecker();
const vEnvSetup = new VEnvSetup();
const vsCodeChecker = new VSCodeChecker();
const qiskitInstaller = new QiskitInstaller();

contextBridge.exposeInMainWorld("api", {
  checkPythonInstalled: () => pythonChecker.checkPythonInstalled(),
  loadStep: (stepName) => ipcRenderer.send("load-step", stepName),
  createVirEnv: (folderName) => VEnvSetup.createVirEnv(folderName),
  openExternalLink: (url) => {
    return ipcRenderer.invoke("open-external", url);
  },
  openFolderDialog: async () => {
    return ipcRenderer.invoke("open-folder-dialog");
  },
  checkVSCodeInstalled: () => vsCodeChecker.checkVSCodeInstalled(),
  //   installPackage: () => qiskitInstaller.installQiskit(),
});

ipcRenderer.on("load-step-content", (event, stepName) => {
  const stepModule = require(`./tutorial_steps/${stepName}`);

  const context = {
    pythonChecker,
    vEnvSetup,
    openExternal: (url) => ipcRenderer.invoke("open-external", url),
    loadStep: (stepName) => ipcRenderer.send("load-step", stepName),
    openFolder: () => ipcRenderer.invoke("open-folder-dialog"),
    vsCodeChecker,
    qiskitInstaller,
  };

  if (typeof stepModule === "function") {
    stepModule(context);
  }
});

```

## renderer.js

```js
import { renderSidebar, renderHome } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  const context = {
    loadStep: (stepName) => window.api.loadStep(stepName),
  };
  const sidebar = renderSidebar(context);

  app.appendChild(sidebar);

  const mainContent = document.createElement("div");
  mainContent.id = "main-content";
  mainContent.classList.add("main-content");

  app.appendChild(mainContent);

  renderHome(context);
});

```

## rendererAPI.js

```js
import { QuantumAPI } from "./customAPI.js";

const api = new QuantumAPI();

export function renderAPIUi() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h1>User API Data</h1>
    <p>You can get your IBM Quantum Status data.</p>
    <p>Enter your IBM Quantum Token here.</p>
    <input type="text" id="token-input" placeholder="IBM Quantum Token" />
    <button id="save-token">Save Token</button>
    <button id="get-info">Get User's Information</button>
    <div id="results" style="margin-top:1rem;"></div>
    `;

  const tokenInput = document.getElementById("token-input");
  const saveTokenBtn = document.getElementById("save-token");
  const getInfoBtn = document.getElementById("get-info");
  const resultArea = document.getElementById("results");

  saveTokenBtn.addEventListener("click", () => {
    const token = tokenInput.value.trim();
    api.setToken(token);
    alert("Token saved!");
  });

  getInfoBtn.addEventListener("click", async () => {
    resultArea.textContent = "Loading info...";
    try {
      const data = await api.getInfo();
      resultArea.innerHTML = formatInfoAsHTML(data);
    } catch (error) {
      resultArea.textContent = error;
    }
  });
}

function formatInfoAsHTML(data) {
  const { UserInfo = {}, Usages = {}, Backends = {} } = data;

  const instancesList = (UserInfo.instances || [])
    .map((inst) => `<li>${inst.name} (plan:${inst.plan})</li>`)
    .join("");

  const userInfoHTML = `
    <h2>User Info</h2>
    <p><strong>Email:</strong> ${UserInfo.email || "N/A"}</p>
    <p>Instances:</p>
    <ul>${instancesList}</ul>

    `;

  const periodStart = Usages?.period?.start || "N/A";
  const periodEnd = Usages?.period?.end || "N/A";

  const usageList = (Usages.byInstance || [])
    .map(
      (item) =>
        `<li>
          <strong>${item.instance}</strong> 
          => usage: ${item.usage}/${item.quota}, 
          pendingJobs: ${item.pendingJobs}
        </li>`
    )
    .join("");

  const usageHTML = `
    <h2>Usage</h2>
    <p>Period: ${periodStart} ~ ${periodEnd}</p>
    <ul>${usageList}</ul>
  `;

  const devices = Backends.devices || [];
  const backendsRows = devices
    .map(
      (dev) => `
      <tr>
        <td>${dev.deviceID}</td>
        <td>${dev.state}</td>
        <td>${dev.status}</td>
        <td>${dev.message || ""}</td>
        <td>${dev.length_queue}</td>
        <td>${dev.backend_version}</td>
      </tr>
    `
    )
    .join("");

  const backendsHTML = `
    <h2>Backends</h2>
    <table border="1" cellspacing="0" cellpadding="4">
      <thead>
        <tr>
          <th>Device ID</th>
          <th>State</th>
          <th>Status</th>
          <th>Message</th>
          <th>Queue</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        ${backendsRows}
      </tbody>
    </table>
  `;

  return userInfoHTML + usageHTML + backendsHTML;
}

```

## sidebar.js

```js
import { QuantumAPI } from "./customAPI.js";
import { renderAPIUi } from "./rendererAPI.js";

const api = new QuantumAPI();

export function renderSidebar(context) {
  const sidebar = document.createElement("div");
  sidebar.classList.add("sidebar");

  const title = document.createElement("h2");
  title.textContent = "Menu";
  sidebar.appendChild(title);

  const btnHome = document.createElement("button");
  btnHome.textContent = "Home";
  btnHome.addEventListener("click", () => {
    renderHome(context);
  });
  sidebar.appendChild(btnHome);

  const btnTutorial = document.createElement("button");
  btnTutorial.textContent = "Installation Tutorial";
  btnTutorial.addEventListener("click", () => {
    window.api.loadStep("step1");
  });
  sidebar.appendChild(btnTutorial);

  const btnExample = document.createElement("button");
  btnExample.textContent = "Examples";
  btnExample.addEventListener("click", () => {
    renderExamples(context);
  });
  sidebar.appendChild(btnExample);

  const btnCustom = document.createElement("button");
  btnCustom.textContent = "User API Data";
  btnCustom.addEventListener("click", () => {
    renderAPIUi();
  });
  sidebar.appendChild(btnCustom);

  return sidebar;
}

export function renderHome(context) {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h1>Guide of How to Set Qiskit Environment</h1>
    <p>Please use the sidebar to navigate</p>
    `;
}

function renderExamples(context) {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h1>Examples Section</h1>
    <p>Choose an example:</p>
    <button id="btn-basics-qi">Basics of Quantum Info</button>
    <div id="example-area" style="margin-top:1rem;"></div>
  `;

  const basicsBtn = document.getElementById("btn-basics-qi");
  const exampleArea = document.getElementById("example-area");

  basicsBtn.addEventListener("click", async () => {
    const module = await import("./examples/ex_BasicsQI.js");
    module.default();
  });
}

```

## tutorial_steps\step1.js

```js
module.exports = function stepPythonChecker(context) {
  const { pythonChecker, openExternal, loadStep } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container">
            <canvas class="canvas"></canvas>
            <p>Steps (1/4)</p>
        </div>
        <h1>Step 1: Check Python Installation</h1>
        <button id="check-python">Check Python Installation</button>
        <p id="python-status">Click to Check</p>
        <p id="warning-message"></p>
    `;

  const checkButton = document.getElementById("check-python");
  const statusText = document.getElementById("python-status");
  const warningText = document.getElementById("warning-message");

  checkButton.addEventListener("click", async () => {
    // const pythonStatus = await window.api.checkPythonInstalled();
    const pythonStatus = await pythonChecker.checkPythonInstalled();

    // pythonStatus.installed = false;

    if (pythonStatus.installed) {
      statusText.textContent = `Python Installed: ${pythonStatus.version}`;
      warningText.textContent = "You can click to next step button";

      const nextStepBtn = document.createElement("button");
      nextStepBtn.textContent = "Next Step";
      warningText.appendChild(document.createElement("br"));
      warningText.appendChild(nextStepBtn);
      nextStepBtn.addEventListener("click", () => {
        loadStep("step2");
      });
    } else {
      statusText.textContent = "Python is not installed.";

      const installBtn = document.createElement("button");
      installBtn.textContent = "Go to Python Download Page";
      warningText.textContent =
        "!!  When you install Python, you MUST check path-env option  !!";

      statusText.appendChild(document.createElement("br"));
      statusText.appendChild(installBtn);
      statusText.appendChild(document.createElement("br"));

      installBtn.addEventListener("click", () => {
        openExternal("https://www.python.org/downloads");

        statusText.textContent =
          "After Installation, Please Click Re-check Button";

        const reCheckBtn = document.createElement("button");
        reCheckBtn.textContent = "Re-Check Python Installation";
        statusText.appendChild(document.createElement("br"));
        statusText.appendChild(reCheckBtn);

        reCheckBtn.addEventListener("click", () => {
          if (pythonStatus.installed) {
            statusText.textContent = `Python Installed: ${pythonStatus.version}`;

            const nextStepBtn = document.createElement("button");
            nextStepBtn.textContent = "Next Step";

            warningText.appendChild(document.createElement("br"));
            warningText.appendChild(nextStepBtn);

            nextStepBtn.addEventListener("click", () => {
              loadStep("step2");
            });
          } else {
            statusText.textContent = "Python is still not installed yet.";
          }
        });
      });
    }
  });
};

```

## tutorial_steps\step2.js

```js
module.exports = function stepSetupVirtualEnv(context) {
  const { vEnvSetup, loadStep, openFolder } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
    <div class="container">
      <canvas class="canvas"></canvas>
      <p>Steps (2/4)</p>
    </div>
    <h1>Step 2: Configure Virtual Environment</h1>

    <button id="setup-venv">Setup Virtual Environment</button>
    <p id="venv-status">Click to Set up</p>

    <p id="warning-message"></p>

    <button id="skip">Skip Button</button>
    <p id="skip-message">If you already make your own python environment, please skip this step.</p>

    <div id="choice-container" style="margin-top: 1rem, display: none;">
      <p>Please choose how you want to create the virtual environment:</p>
      <input type="radio", name="setup-type" value="auto"> Automatic (./venv)
      <input type="radio", name="setup-type" value="manual"> Manual (Select a Folder)
    </div>
  `;

  const setupButton = document.getElementById("setup-venv");
  const statusText = document.getElementById("venv-status");
  const warningText = document.getElementById("warning-message");
  const skipButton = document.getElementById("skip");

  setupButton.addEventListener("click", async () => {
    statusText.textContent = "Setting up virtual environment...";

    const selectedRadio = document.querySelector(
      `input[name="setup-type"]:checked`
    );

    if (!selectedRadio) {
      warningText.textContent =
        "You must choose an option (Automatic / Manual) first.";
      return;
    }

    if (selectedRadio.value === "auto") {
      statusText.textContent = "Setting up virtual environment (Auto) ...";
      try {
        await vEnvSetup.createVEnv("./venv");
        statusText.textContent = "Automatically created venv at ./venv !";

        const nextStepBtn = document.createElement("button");
        nextStepBtn.textContent = "Next Step";

        warningText.appendChild(document.createElement("br"));
        warningText.appendChild(nextStepBtn);

        nextStepBtn.addEventListener("click", () => {
          loadStep("step2");
        });
      } catch (error) {
        warningText.textContent =
          "Failed to create virtual environment" + error;
        return;
      }
    } else if (selectedRadio.value === "manual") {
      try {
        const folderPath = await openFolder();

        if (!folderPath) {
          statusText.textContent = "Canceled manual setup.";
          return;
        }

        context.venvPath = folderPath;

        await vEnvSetup.createVEnv(folderPath);
        statusText.textContent = `Manually created venv at: ${folderPath}`;

        const nextStepBtn = document.createElement("button");
        nextStepBtn.textContent = "Next Step";

        warningText.appendChild(document.createElement("br"));
        warningText.appendChild(nextStepBtn);

        nextStepBtn.addEventListener("click", () => {
          loadStep("step2");
        });
      } catch (error) {
        warningText.textContent =
          "Failed to create virtual environment" + error;
        return;
      }
    }
  });

  skipButton.addEventListener("click", async () => {
    loadStep("step3");
  });
};

```

## tutorial_steps\step3.js

```js
module.exports = function stepVSCodeChecker(context) {
  const { vsCodeChecker, openExternal, loadStep } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container">
            <canvas class="canvas"></canvas>
            <p>Steps (3/4)</p>
        </div>
        <h1>Step 3: Check VSCode Installation</h1>
        <button id="check-vscode">Check Visual Studio Code Installation</button>
        <p id="vscode-status">Click to Check</p>
        <p id="warning-message"></p>
    `;

  const checkButton = document.getElementById("check-vscode");
  const statusText = document.getElementById("vscode-status");
  const warningText = document.getElementById("warning-message");

  checkButton.addEventListener("click", async () => {
    let vscodeStatus;
    try {
      vscodeStatus = await vsCodeChecker.checkVSCodeInstalled();
    } catch (err) {
      vscodeStatus = { installed: false };
    }

    if (vscodeStatus.installed) {
      statusText.textContent = `Visual Studio Code Installed: ${
        vscodeStatus.version || ""
      }`;
      warningText.textContent =
        "Visual Studio Code is already installed. Please go to the next step.";

      const nextStepBtn = document.createElement("button");
      nextStepBtn.textContent = "Next Step";
      warningText.appendChild(document.createElement("br"));
      warningText.appendChild(nextStepBtn);

      nextStepBtn.addEventListener("click", () => {
        loadStep("step4");
      });
    } else {
      statusText.textContent = "VSCode is not installed.";

      const installBtn = document.createElement("button");
      installBtn.textContent = "Go to Visual Studio Code Download Page";
      warningText.textContent =
        "Visual Studio Code is not installed. Please Click to go to download page.";

      statusText.appendChild(document.createElement("br"));
      statusText.appendChild(installBtn);

      installBtn.addEventListener("click", () => {
        openExternal("https://code.visualstudio.com/download");

        statusText.textContent =
          "After Installation, Please Click Re-check Button";

        const reCheckBtn = document.createElement("button");
        reCheckBtn.textContent = "Re-Check Visual Studio Code Installation";
        statusText.appendChild(document.createElement("br"));
        statusText.appendChild(reCheckBtn);

        reCheckBtn.addEventListener("click", () => {
          if (pythonStatus.installed) {
            statusText.textContent = `Visual Studio Code Installed: ${vscodeStatus.version}`;

            const nextStepBtn = document.createElement("button");
            nextStepBtn.textContent = "Next Step";

            warningText.appendChild(document.createElement("br"));
            warningText.appendChild(nextStepBtn);

            nextStepBtn.addEventListener("click", () => {
              loadStep("step4");
            });
          } else {
            statusText.textContent =
              "Visual Studio Code is still not installed yet.";
          }
        });
      });
    }
  });
};

```

## tutorial_steps\step4.js

```js
module.exports = function stepInstallQiskit(context) {
  const { loadStep, openExternal, qiskitInstaller } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container">
            <canvas class="canvas"></canvas>
            <p>Steps (4/4)</p>
        </div>
        <h1>Step 4: Install Qiskit in your Python Environment using VSCode</h1>
        <button id="install-qiskit">Install Qiskit</button>
        <p id="installation-status">Click to Install Qiskit at your venv</p>
        <p id="warning-message"></p>

        <p>\n\n</p>
        <button id="open-docs">Open Qiskit Docs</button>
        <p>Would you like to take a look at the Qiskit documentation while you wait for the installation to complete?</p>
        <button id="finish-tutorial" style="display:none;">Finish Tutorial</button>

    `;

  const installBtn = document.getElementById("install-qiskit");
  const statusText = document.getElementById("installation-status");
  const warningText = document.getElementById("warning-message");
  const finishBtn = document.getElementById("finish-tutorial");
  const docsBtn = document.getElementById("open-docs");

  docsBtn.addEventListener("click", () => {
    openExternal("https://quantum.cloud.ibm.com/docs/en/guides/hello-world");
  });

  installBtn.addEventListener("click", async () => {
    statusText.textContent = "Install Qiskit...";
    warningText.textContent = "";

    try {
      let venvPath = context.venvPath;

      if (!venvPath) {
        warningText.textContent = "qiskit will be installed at ./venv ";
        venvPath = "./venv";
      }
      console.log(venvPath);
      await qiskitInstaller.installQiskit(venvPath);
      statusText.textContent = "Qiskit installation completed successfully!";
      warningText.textContent = `Qiskit is now installed in ${venvPath}!`;

      finishBtn.style.display = "inline-block";
    } catch (error) {
      statusText.textContent = "Qiskit installation failed";
      warningText.textContent = `Error: ${error}`;
    }
  });

  finishBtn.addEventListener("click", () => {
    warningText.textContent = "Tutorial is finished.";
  });
};

```

