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
