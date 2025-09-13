class ErrorHandler {
    constructor() {
        this.errors = [];
    }

    handleError(error, context = '') {
        const errorDetail = {
            message: error.message || error,
            context,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };
        
        this.errors.push(errorDetail);
        console.error(`[${context}] Error:`, error);
        
        return this.getUserFriendlyMessage(error, context);
    }

    getUserFriendlyMessage(error, context) {
        const errorMessages = {
            'python_not_found': {
                title: 'Python Not Installed',
                message: 'Python is required to run Qiskit. Please install Python 3.8 or later.',
                action: 'Click "Install Python" to download and install Python from the official website.',
                tips: ['Make sure to check "Add Python to PATH" during installation', 'Restart the application after installing Python']
            },
            'venv_creation_failed': {
                title: 'Virtual Environment Creation Failed',
                message: 'Unable to create a Python virtual environment.',
                action: 'Please check if Python is properly installed and you have write permissions.',
                tips: ['Try running as administrator', 'Check if the selected folder is not read-only', 'Ensure Python venv module is installed']
            },
            'venv_already_exists': {
                title: 'Virtual Environment Already Exists',
                message: 'A virtual environment already exists in this location.',
                action: 'Choose a different folder or delete the existing environment.',
                tips: ['Select a new folder', 'Or manually delete the existing venv folder']
            },
            'qiskit_install_failed': {
                title: 'Qiskit Installation Failed',
                message: 'Unable to install Qiskit packages.',
                action: 'Check your internet connection and try again.',
                tips: ['Ensure you have a stable internet connection', 'Try updating pip: python -m pip install --upgrade pip', 'Check if you have sufficient disk space']
            },
            'vscode_not_found': {
                title: 'VS Code Not Installed',
                message: 'Visual Studio Code is recommended for development.',
                action: 'Click "Install VS Code" to download it.',
                tips: ['VS Code provides excellent Python and Jupyter support', 'Install the Python extension after VS Code installation']
            },
            'invalid_token': {
                title: 'Invalid IBM Quantum Token',
                message: 'The provided token is invalid or expired.',
                action: 'Please check your token and try again.',
                tips: ['Get your token from quantum.ibm.com', 'Ensure the token is copied correctly without extra spaces']
            },
            'network_error': {
                title: 'Network Connection Error',
                message: 'Unable to connect to the required services.',
                action: 'Check your internet connection and firewall settings.',
                tips: ['Disable VPN if active', 'Check proxy settings', 'Ensure firewall allows Python and npm']
            },
            'permission_denied': {
                title: 'Permission Denied',
                message: 'Insufficient permissions to perform this operation.',
                action: 'Try running the application as administrator.',
                tips: ['Right-click and select "Run as administrator"', 'Check folder permissions']
            },
            'path_not_found': {
                title: 'Path Not Found',
                message: 'The specified path does not exist.',
                action: 'Please select a valid folder.',
                tips: ['Create the folder first', 'Check for typos in the path']
            },
            'duplicate_install': {
                title: 'Package Already Installed',
                message: 'This package is already installed.',
                action: 'You can proceed to the next step.',
                tips: ['Check installed packages with: pip list', 'Update existing packages with: pip install --upgrade']
            }
        };

        let errorType = this.detectErrorType(error, context);
        return errorMessages[errorType] || {
            title: 'Unexpected Error',
            message: error.message || 'An unexpected error occurred.',
            action: 'Please try again or contact support.',
            tips: ['Check the console for more details', 'Restart the application']
        };
    }

    detectErrorType(error, context) {
        const errorString = error.toString().toLowerCase();
        
        if (context.includes('python') && (errorString.includes('not found') || errorString.includes('not recognized'))) {
            return 'python_not_found';
        }
        if (context.includes('venv') && errorString.includes('failed')) {
            return 'venv_creation_failed';
        }
        if (context.includes('venv') && errorString.includes('exists')) {
            return 'venv_already_exists';
        }
        if (context.includes('qiskit') && errorString.includes('failed')) {
            return 'qiskit_install_failed';
        }
        if (context.includes('vscode') && errorString.includes('not found')) {
            return 'vscode_not_found';
        }
        if (context.includes('token') && (errorString.includes('401') || errorString.includes('unauthorized'))) {
            return 'invalid_token';
        }
        if (errorString.includes('network') || errorString.includes('enotfound') || errorString.includes('etimedout')) {
            return 'network_error';
        }
        if (errorString.includes('permission') || errorString.includes('access denied') || errorString.includes('eacces')) {
            return 'permission_denied';
        }
        if (errorString.includes('enoent') || errorString.includes('path')) {
            return 'path_not_found';
        }
        if (errorString.includes('already') || errorString.includes('duplicate')) {
            return 'duplicate_install';
        }
        
        return 'unknown';
    }

    showErrorDialog(errorInfo) {
        const dialog = `
            <div class="error-dialog">
                <div class="error-header">
                    <span class="error-icon">⚠️</span>
                    <h3>${errorInfo.title}</h3>
                </div>
                <div class="error-body">
                    <p class="error-message">${errorInfo.message}</p>
                    <p class="error-action"><strong>What to do:</strong> ${errorInfo.action}</p>
                    ${errorInfo.tips && errorInfo.tips.length > 0 ? `
                        <div class="error-tips">
                            <strong>Tips:</strong>
                            <ul>
                                ${errorInfo.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                <button class="error-close" onclick="this.parentElement.remove()">OK</button>
            </div>
        `;
        return dialog;
    }

    clearErrors() {
        this.errors = [];
    }

    getErrorLog() {
        return this.errors;
    }
}

module.exports = ErrorHandler;