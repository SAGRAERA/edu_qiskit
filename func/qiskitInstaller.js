const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

class QiskitInstaller {
  async installQiskit(venvPath = "./venv", progressCallback = null) {
    return new Promise((resolve, reject) => {
      let pipPath;

      if (os.platform() === "win32") {
        pipPath = path.join(venvPath, "Scripts", "pip.exe");
      } else {
        pipPath = path.join(venvPath, "bin", "pip");
      }

      // 설치할 패키지 목록
      const packages = [
        "qiskit==1.4.2",
        "qiskit-ibm-runtime",
        "matplotlib",
        "pylatexenc"
      ];

      // spawn을 사용하여 실시간 출력 가능
      const installProcess = spawn(pipPath, ["install", ...packages], {
        shell: true,
        windowsHide: true
      });

      let output = "";
      let errorOutput = "";

      // 실시간 출력 처리
      installProcess.stdout.on("data", (data) => {
        const text = data.toString();
        output += text;
        if (progressCallback) {
          progressCallback({ type: "stdout", data: text });
        }
      });

      installProcess.stderr.on("data", (data) => {
        const text = data.toString();
        errorOutput += text;
        if (progressCallback) {
          progressCallback({ type: "stderr", data: text });
        }
      });

      installProcess.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Installation failed with code ${code}: ${errorOutput}`));
        } else {
          resolve({ success: true, output });
        }
      });

      installProcess.on("error", (error) => {
        reject(error);
      });
    });
  }
}

module.exports = { QiskitInstaller };
