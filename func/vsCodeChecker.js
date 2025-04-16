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