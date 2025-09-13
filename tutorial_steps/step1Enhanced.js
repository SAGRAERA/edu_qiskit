const PythonCheckerEnhanced = require('../func/pythonCheckerEnhanced');
const ErrorHandler = require('../func/errorHandler');

module.exports = function stepPythonChecker(context) {
    const { openExternal, loadStep } = context;
    const mainContent = document.getElementById("main-content");
    const pythonChecker = new PythonCheckerEnhanced();
    const errorHandler = new ErrorHandler();
    
    let currentStep = 1;
    const totalSteps = 4;

    mainContent.innerHTML = `
        <div class="card">
            <div class="step-indicator">
                <div class="step active">
                    <div class="step-circle">1</div>
                    <div class="step-label">Python Check</div>
                </div>
                <div class="step">
                    <div class="step-circle">2</div>
                    <div class="step-label">Virtual Env</div>
                </div>
                <div class="step">
                    <div class="step-circle">3</div>
                    <div class="step-label">Install Qiskit</div>
                </div>
                <div class="step">
                    <div class="step-circle">4</div>
                    <div class="step-label">Setup Complete</div>
                </div>
            </div>
            
            <h1>Step 1: Check Python Installation</h1>
            <p>Let's check if Python is properly installed on your system. Qiskit requires Python 3.8 or later.</p>
            
            <div id="python-info" class="info-panel" style="display: none;">
                <h3>System Information</h3>
                <div id="system-details"></div>
            </div>
            
            <div class="action-buttons">
                <button id="check-python" class="primary">
                    <span>Check Python Installation</span>
                </button>
            </div>
            
            <div id="status-area" class="status-area"></div>
            <div id="error-area"></div>
            
            <div class="progress-container" style="display: none;">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
        </div>
    `;

    const checkButton = document.getElementById("check-python");
    const statusArea = document.getElementById("status-area");
    const errorArea = document.getElementById("error-area");
    const pythonInfo = document.getElementById("python-info");
    const systemDetails = document.getElementById("system-details");
    const progressBar = document.getElementById("progress-bar");

    checkButton.addEventListener("click", async () => {
        checkButton.disabled = true;
        statusArea.innerHTML = '<div class="loading-spinner"></div><p>Checking Python installation...</p>';
        errorArea.innerHTML = '';
        
        try {
            const pythonStatus = await pythonChecker.getPythonInfo();
            
            if (pythonStatus.installed && pythonStatus.versionOk) {
                pythonInfo.style.display = 'block';
                systemDetails.innerHTML = `
                    <table>
                        <tr>
                            <td><strong>Version:</strong></td>
                            <td><span class="badge badge-success">Python ${pythonStatus.version}</span></td>
                        </tr>
                        <tr>
                            <td><strong>Command:</strong></td>
                            <td><code>${pythonStatus.command}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Executable:</strong></td>
                            <td><code>${pythonStatus.executable || 'N/A'}</code></td>
                        </tr>
                        <tr>
                            <td><strong>Platform:</strong></td>
                            <td>${pythonStatus.platform || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Architecture:</strong></td>
                            <td>${pythonStatus.architecture || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Pip Installed:</strong></td>
                            <td>${pythonStatus.pipInstalled 
                                ? '<span class="badge badge-success">Yes</span>' 
                                : '<span class="badge badge-warning">No</span>'}</td>
                        </tr>
                    </table>
                `;
                
                statusArea.innerHTML = `
                    <div class="success-message">
                        <h3>✅ Python is properly installed!</h3>
                        <p>Your system meets all requirements for Qiskit installation.</p>
                    </div>
                `;
                
                if (!pythonStatus.pipInstalled) {
                    statusArea.innerHTML += `
                        <div class="warning-message">
                            <p>⚠️ Pip is not installed. Installing pip...</p>
                        </div>
                    `;
                    
                    try {
                        await pythonChecker.installPip(pythonStatus.command);
                        statusArea.innerHTML += `
                            <div class="success-message">
                                <p>✅ Pip installed successfully!</p>
                            </div>
                        `;
                    } catch (pipError) {
                        statusArea.innerHTML += `
                            <div class="warning-message">
                                <p>⚠️ Could not install pip automatically. You may need to install it manually.</p>
                            </div>
                        `;
                    }
                }
                
                const nextButton = document.createElement("button");
                nextButton.textContent = "Continue to Next Step";
                nextButton.className = "success";
                nextButton.addEventListener("click", () => {
                    loadStep("step2Enhanced");
                });
                statusArea.appendChild(nextButton);
                
            } else if (pythonStatus.installed && !pythonStatus.versionOk) {
                const errorInfo = errorHandler.getUserFriendlyMessage(
                    new Error(pythonStatus.error),
                    'python_version'
                );
                errorArea.innerHTML = errorHandler.showErrorDialog(errorInfo);
                
                statusArea.innerHTML = `
                    <div class="warning-message">
                        <h3>⚠️ Python Version Too Old</h3>
                        <p>${pythonStatus.error}</p>
                        <button id="download-python" class="warning">Download Latest Python</button>
                    </div>
                `;
                
                document.getElementById("download-python").addEventListener("click", () => {
                    openExternal("https://www.python.org/downloads");
                });
                
            } else {
                const errorInfo = errorHandler.getUserFriendlyMessage(
                    new Error('Python not found'),
                    'python_not_found'
                );
                errorArea.innerHTML = errorHandler.showErrorDialog(errorInfo);
                
                statusArea.innerHTML = `
                    <div class="error-message">
                        <h3>❌ Python Not Found</h3>
                        <p>Python is not installed or not in your system PATH.</p>
                        <button id="install-python" class="danger">Install Python</button>
                    </div>
                `;
                
                document.getElementById("install-python").addEventListener("click", () => {
                    openExternal("https://www.python.org/downloads");
                    
                    statusArea.innerHTML += `
                        <div class="info-message">
                            <h4>Installation Instructions:</h4>
                            <ol>
                                <li>Download Python 3.8 or later</li>
                                <li><strong>IMPORTANT:</strong> Check "Add Python to PATH" during installation</li>
                                <li>Complete the installation</li>
                                <li>Restart this application</li>
                                <li>Click "Re-check Python Installation"</li>
                            </ol>
                            <button id="recheck" class="primary">Re-check Python Installation</button>
                        </div>
                    `;
                    
                    document.getElementById("recheck").addEventListener("click", () => {
                        location.reload();
                    });
                });
            }
        } catch (error) {
            const errorInfo = errorHandler.handleError(error, 'python_check');
            errorArea.innerHTML = errorHandler.showErrorDialog(errorInfo);
            statusArea.innerHTML = `
                <div class="error-message">
                    <h3>❌ Error During Check</h3>
                    <p>An unexpected error occurred while checking Python installation.</p>
                </div>
            `;
        } finally {
            checkButton.disabled = false;
        }
    });
};