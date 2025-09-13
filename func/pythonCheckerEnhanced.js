const { exec } = require("child_process");
const ErrorHandler = require("./errorHandler");

class PythonCheckerEnhanced {
    constructor() {
        this.pythonInstalled = false;
        this.pythonVersion = null;
        this.pipInstalled = false;
        this.errorHandler = new ErrorHandler();
    }

    checkPythonInstalled() {
        return new Promise((resolve) => {
            const commands = ['python', 'python3', 'py'];
            let checkIndex = 0;
            
            const tryCommand = () => {
                if (checkIndex >= commands.length) {
                    resolve({
                        installed: false,
                        version: null,
                        command: null,
                        error: 'Python not found in PATH'
                    });
                    return;
                }
                
                const cmd = commands[checkIndex];
                exec(`${cmd} --version`, (error, stdout, stderr) => {
                    if (!error) {
                        const version = stdout.trim() || stderr.trim();
                        const versionMatch = version.match(/Python (\d+\.\d+\.\d+)/);
                        
                        if (versionMatch) {
                            const [major, minor] = versionMatch[1].split('.').map(Number);
                            
                            if (major >= 3 && minor >= 8) {
                                this.pythonInstalled = true;
                                this.pythonVersion = versionMatch[1];
                                this.pythonCommand = cmd;
                                
                                this.checkPipInstalled(cmd).then(pipInstalled => {
                                    resolve({
                                        installed: true,
                                        version: versionMatch[1],
                                        command: cmd,
                                        pipInstalled,
                                        versionOk: true
                                    });
                                });
                            } else {
                                resolve({
                                    installed: true,
                                    version: versionMatch[1],
                                    command: cmd,
                                    versionOk: false,
                                    error: `Python ${versionMatch[1]} found, but Qiskit requires Python 3.8 or later`
                                });
                            }
                        } else {
                            checkIndex++;
                            tryCommand();
                        }
                    } else {
                        checkIndex++;
                        tryCommand();
                    }
                });
            };
            
            tryCommand();
        });
    }

    checkPipInstalled(pythonCmd) {
        return new Promise((resolve) => {
            exec(`${pythonCmd} -m pip --version`, (error, stdout, stderr) => {
                if (!error) {
                    this.pipInstalled = true;
                    resolve(true);
                } else {
                    this.pipInstalled = false;
                    resolve(false);
                }
            });
        });
    }

    installPip(pythonCmd) {
        return new Promise((resolve, reject) => {
            exec(`${pythonCmd} -m ensurepip --upgrade`, (error, stdout, stderr) => {
                if (error) {
                    const errorInfo = this.errorHandler.handleError(error, 'pip_installation');
                    reject(errorInfo);
                } else {
                    resolve(true);
                }
            });
        });
    }

    getPythonInfo() {
        return new Promise(async (resolve) => {
            const result = await this.checkPythonInstalled();
            
            if (result.installed && result.versionOk) {
                exec(`${result.command} -c "import sys; import platform; print(f'{sys.executable}|{platform.machine()}|{platform.system()}')"`, 
                    (error, stdout, stderr) => {
                        if (!error) {
                            const [executable, machine, system] = stdout.trim().split('|');
                            resolve({
                                ...result,
                                executable,
                                architecture: machine,
                                platform: system
                            });
                        } else {
                            resolve(result);
                        }
                    }
                );
            } else {
                resolve(result);
            }
        });
    }

    checkPackageInstalled(packageName, pythonCmd = 'python') {
        return new Promise((resolve) => {
            exec(`${pythonCmd} -c "import ${packageName}"`, (error) => {
                resolve(!error);
            });
        });
    }
}

module.exports = PythonCheckerEnhanced;