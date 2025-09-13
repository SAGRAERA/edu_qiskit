const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const ErrorHandler = require("./errorHandler");

class VEnvSetupEnhanced {
    constructor() {
        this.venvPath = null;
        this.errorHandler = new ErrorHandler();
        this.pythonCommand = 'python';
    }

    setPythonCommand(cmd) {
        this.pythonCommand = cmd;
    }

    checkVenvExists(folderPath) {
        const venvIndicators = [
            path.join(folderPath, 'pyvenv.cfg'),
            path.join(folderPath, 'Scripts', 'activate'),
            path.join(folderPath, 'bin', 'activate')
        ];
        
        return venvIndicators.some(indicator => fs.existsSync(indicator));
    }

    validateFolderPath(folderPath) {
        if (!folderPath) {
            return { valid: false, error: 'No folder path provided' };
        }
        
        if (!fs.existsSync(path.dirname(folderPath))) {
            return { valid: false, error: 'Parent directory does not exist' };
        }
        
        try {
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            
            const testFile = path.join(folderPath, '.write_test');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            
            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'No write permission in selected folder' };
        }
    }

    createVirEnv(folderPath, envName = 'qiskit_env') {
        return new Promise((resolve, reject) => {
            const validation = this.validateFolderPath(folderPath);
            if (!validation.valid) {
                const errorInfo = this.errorHandler.handleError(
                    new Error(validation.error),
                    'venv_validation'
                );
                reject(errorInfo);
                return;
            }

            const fullPath = path.join(folderPath, envName);
            
            if (this.checkVenvExists(fullPath)) {
                const errorInfo = this.errorHandler.handleError(
                    new Error('Virtual environment already exists'),
                    'venv_duplicate'
                );
                reject({
                    ...errorInfo,
                    existingPath: fullPath,
                    suggestion: 'Use a different name or delete the existing environment'
                });
                return;
            }

            const createCommand = `${this.pythonCommand} -m venv "${fullPath}"`;
            
            exec(createCommand, (error, stdout, stderr) => {
                if (error) {
                    const errorInfo = this.errorHandler.handleError(error, 'venv_creation');
                    reject(errorInfo);
                } else {
                    this.venvPath = fullPath;
                    
                    this.upgradeVenvPip(fullPath).then(() => {
                        resolve({
                            success: true,
                            path: fullPath,
                            activateCommand: this.getActivateCommand(fullPath)
                        });
                    }).catch(pipError => {
                        resolve({
                            success: true,
                            path: fullPath,
                            activateCommand: this.getActivateCommand(fullPath),
                            warning: 'Virtual environment created but pip upgrade failed'
                        });
                    });
                }
            });
        });
    }

    getActivateCommand(venvPath) {
        const platform = process.platform;
        
        if (platform === 'win32') {
            return {
                cmd: `"${path.join(venvPath, 'Scripts', 'activate.bat')}"`,
                powershell: `& "${path.join(venvPath, 'Scripts', 'Activate.ps1')}"`,
                python: `"${path.join(venvPath, 'Scripts', 'python.exe')}"`
            };
        } else {
            return {
                bash: `source "${path.join(venvPath, 'bin', 'activate')}"`,
                python: `"${path.join(venvPath, 'bin', 'python')}"`
            };
        }
    }

    upgradeVenvPip(venvPath) {
        return new Promise((resolve, reject) => {
            const pythonExe = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'python.exe')
                : path.join(venvPath, 'bin', 'python');
                
            exec(`"${pythonExe}" -m pip install --upgrade pip`, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }

    deleteVenv(venvPath) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(venvPath)) {
                resolve({ success: true, message: 'Virtual environment does not exist' });
                return;
            }

            const command = process.platform === 'win32' 
                ? `rmdir /s /q "${venvPath}"`
                : `rm -rf "${venvPath}"`;
                
            exec(command, (error) => {
                if (error) {
                    const errorInfo = this.errorHandler.handleError(error, 'venv_deletion');
                    reject(errorInfo);
                } else {
                    resolve({ success: true, message: 'Virtual environment deleted successfully' });
                }
            });
        });
    }

    listInstalledPackages(venvPath) {
        return new Promise((resolve, reject) => {
            const pythonExe = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'python.exe')
                : path.join(venvPath, 'bin', 'python');
                
            exec(`"${pythonExe}" -m pip list --format=json`, (error, stdout) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        const packages = JSON.parse(stdout);
                        resolve(packages);
                    } catch (parseError) {
                        reject(parseError);
                    }
                }
            });
        });
    }
}

module.exports = VEnvSetupEnhanced;