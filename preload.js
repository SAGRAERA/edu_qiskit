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
  quantumAPIRequest: async (options) => {
    return ipcRenderer.invoke("quantum-api-request", options);
  },
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
