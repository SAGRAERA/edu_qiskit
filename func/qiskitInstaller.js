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
