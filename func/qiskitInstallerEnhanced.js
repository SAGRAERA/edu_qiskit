const { exec } = require("child_process");
const path = require("path");
const ErrorHandler = require("./errorHandler");

class QiskitInstallerEnhanced {
    constructor() {
        this.errorHandler = new ErrorHandler();
        this.installedPackages = new Set();
    }

    checkPackageInstalled(pythonPath, packageName) {
        return new Promise((resolve) => {
            exec(`"${pythonPath}" -c "import ${packageName}"`, (error) => {
                resolve(!error);
            });
        });
    }

    async checkQiskitComponents(pythonPath) {
        const components = {
            'qiskit': false,
            'qiskit_ibm_runtime': false,
            'matplotlib': false,
            'jupyter': false,
            'notebook': false,
            'qiskit_aer': false
        };

        for (const component of Object.keys(components)) {
            components[component] = await this.checkPackageInstalled(pythonPath, component.replace('-', '_'));
        }

        return components;
    }

    installQiskit(venvPath, options = {}) {
        return new Promise(async (resolve, reject) => {
            const pythonExe = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'python.exe')
                : path.join(venvPath, 'bin', 'python');

            const installedComponents = await this.checkQiskitComponents(pythonExe);
            
            const packages = [];
            
            if (!installedComponents.qiskit || options.forceReinstall) {
                packages.push('qiskit[visualization]');
            }
            
            if (!installedComponents.qiskit_ibm_runtime || options.forceReinstall) {
                packages.push('qiskit-ibm-runtime');
            }
            
            if (!installedComponents.matplotlib) {
                packages.push('matplotlib');
            }
            
            if (!installedComponents.jupyter || !installedComponents.notebook) {
                packages.push('jupyter', 'notebook', 'ipykernel');
            }

            if (packages.length === 0) {
                resolve({
                    success: true,
                    message: 'All Qiskit components are already installed',
                    alreadyInstalled: true,
                    components: installedComponents
                });
                return;
            }

            const installCommand = `"${pythonExe}" -m pip install ${packages.join(' ')}`;
            const totalPackages = packages.length;
            let installedCount = 0;
            
            const childProcess = exec(installCommand, { maxBuffer: 1024 * 1024 * 10 });
            
            childProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Successfully installed')) {
                    installedCount++;
                    if (options.onProgress) {
                        options.onProgress({
                            current: installedCount,
                            total: totalPackages,
                            message: `Installing ${packages[installedCount - 1] || 'packages'}...`
                        });
                    }
                }
            });

            childProcess.on('exit', async (code) => {
                if (code === 0) {
                    const finalComponents = await this.checkQiskitComponents(pythonExe);
                    
                    await this.setupJupyterKernel(venvPath);
                    
                    resolve({
                        success: true,
                        message: 'Qiskit installation completed successfully',
                        components: finalComponents,
                        installedPackages: packages
                    });
                } else {
                    const errorInfo = this.errorHandler.handleError(
                        new Error(`Installation failed with code ${code}`),
                        'qiskit_installation'
                    );
                    reject(errorInfo);
                }
            });

            childProcess.on('error', (error) => {
                const errorInfo = this.errorHandler.handleError(error, 'qiskit_installation');
                reject(errorInfo);
            });
        });
    }

    setupJupyterKernel(venvPath) {
        return new Promise((resolve) => {
            const pythonExe = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'python.exe')
                : path.join(venvPath, 'bin', 'python');
                
            const kernelName = path.basename(venvPath);
            
            exec(`"${pythonExe}" -m ipykernel install --user --name=${kernelName} --display-name="Qiskit (${kernelName})"`, 
                (error) => {
                    if (error) {
                        console.warn('Failed to setup Jupyter kernel:', error);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
    }

    installAdditionalPackages(venvPath, packages) {
        return new Promise((resolve, reject) => {
            const pythonExe = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'python.exe')
                : path.join(venvPath, 'bin', 'python');
                
            const installCommand = `"${pythonExe}" -m pip install ${packages.join(' ')}`;
            
            exec(installCommand, (error, stdout, stderr) => {
                if (error) {
                    const errorInfo = this.errorHandler.handleError(error, 'package_installation');
                    reject(errorInfo);
                } else {
                    resolve({
                        success: true,
                        message: `Successfully installed: ${packages.join(', ')}`,
                        output: stdout
                    });
                }
            });
        });
    }

    uninstallPackage(venvPath, packageName) {
        return new Promise((resolve, reject) => {
            const pythonExe = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'python.exe')
                : path.join(venvPath, 'bin', 'python');
                
            exec(`"${pythonExe}" -m pip uninstall -y ${packageName}`, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        success: true,
                        message: `Successfully uninstalled ${packageName}`
                    });
                }
            });
        });
    }

    updateQiskit(venvPath) {
        return new Promise((resolve, reject) => {
            const pythonExe = process.platform === 'win32' 
                ? path.join(venvPath, 'Scripts', 'python.exe')
                : path.join(venvPath, 'bin', 'python');
                
            const updateCommand = `"${pythonExe}" -m pip install --upgrade qiskit qiskit-ibm-runtime`;
            
            exec(updateCommand, (error, stdout) => {
                if (error) {
                    const errorInfo = this.errorHandler.handleError(error, 'qiskit_update');
                    reject(errorInfo);
                } else {
                    resolve({
                        success: true,
                        message: 'Qiskit updated successfully',
                        output: stdout
                    });
                }
            });
        });
    }
}

module.exports = QiskitInstallerEnhanced;