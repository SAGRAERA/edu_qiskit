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