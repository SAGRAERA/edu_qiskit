module.exports = function stepInstallQiskit(context) {
  const { loadStep, openExternal, qiskitInstaller, openFolder } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container" style="margin-bottom: 1rem; margin-top: -1rem;">
            <canvas class="canvas"></canvas>
            <p style="font-size: 1.2rem; margin-top: 0.5rem; font-weight: bold;">Step 4 of 4</p>
        </div>
        
        <h1 style="margin-bottom: 1.5rem;">Install Qiskit Packages</h1>
        
        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <p style="margin: 0; font-weight: bold; color: #0c5460;">📦 Packages to be installed:</p>
            <ul style="margin: 0.5rem 0 0 1.5rem; color: #0c5460;">
                <li>qiskit (1.4.2) - Core quantum computing library</li>
                <li>qiskit-ibm-runtime - IBM Quantum service integration</li>
                <li>matplotlib - Visualization tools</li>
                <li>pylatexenc - LaTeX encoding support</li>
            </ul>
        </div>

        <div id="venv-selector" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: none;">
            <p style="margin: 0 0 1rem 0; font-weight: bold;">Virtual environment not found. Please select:</p>
            <button id="select-venv" style="padding: 0.6rem 1.5rem; font-size: 1rem; margin-right: 1rem;">Select Venv Folder</button>
            <button id="use-default" style="padding: 0.6rem 1.5rem; font-size: 1rem;">Use Default (./venv)</button>
        </div>

        <div id="selected-path" style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: none;">
            <p style="margin: 0; color: #155724;">✅ Selected virtual environment: <strong id="venv-path"></strong></p>
        </div>
        
        <button id="install-qiskit" style="padding: 0.8rem 2rem; font-size: 1.1rem; margin-bottom: 1rem;">Install All Packages</button>
        
        <div id="progress-container" style="display: none; margin-bottom: 1.5rem;">
            <p style="font-weight: bold; margin-bottom: 0.5rem;">Installation Progress:</p>
            <div style="background-color: #f1f1f1; border-radius: 4px; overflow: hidden; height: 30px; margin-bottom: 1rem;">
                <div id="progress-bar" style="background-color: #007bff; height: 100%; width: 0%; transition: width 0.3s;"></div>
            </div>
            <pre id="installation-log" style="background-color: #000; color: #00ff00; padding: 1rem; border-radius: 4px; max-height: 200px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 0.85rem;"></pre>
        </div>
        
        <p id="installation-status" style="font-size: 1.1rem; margin-bottom: 1rem;">Check virtual environment and click install</p>
        
        <p id="warning-message" style="margin-top: 1.5rem;"></p>

        <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-top: 2rem;">
            <p style="margin: 0 0 0.8rem 0; font-weight: bold; color: #856404;">📚 Qiskit Documentation & Examples</p>
            <p style="margin: 0 0 0.8rem 0; color: #856404; font-size: 0.95rem;">Explore Qiskit documentation while packages install:</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                <button id="open-hello-world" style="padding: 0.5rem; font-size: 0.9rem;">Hello World Example</button>
                <button id="open-tutorials" style="padding: 0.5rem; font-size: 0.9rem;">Qiskit Tutorials</button>
                <button id="open-textbook" style="padding: 0.5rem; font-size: 0.9rem;">Qiskit Textbook</button>
                <button id="open-api-docs" style="padding: 0.5rem; font-size: 0.9rem;">API Documentation</button>
            </div>
            <div style="margin-top: 0.8rem;">
                <p style="margin: 0.3rem 0; color: #856404; font-size: 0.85rem;">Additional Examples:</p>
                <ul style="margin: 0.3rem 0 0 1.5rem; color: #856404; font-size: 0.85rem;">
                    <li><a href="#" id="bell-state" style="color: #007bff;">Bell State Creation</a></li>
                    <li><a href="#" id="quantum-teleport" style="color: #007bff;">Quantum Teleportation</a></li>
                    <li><a href="#" id="grover-algo" style="color: #007bff;">Grover's Algorithm</a></li>
                    <li><a href="#" id="vqe-example" style="color: #007bff;">VQE (Variational Quantum Eigensolver)</a></li>
                </ul>
            </div>
        </div>
        
        <button id="finish-tutorial" style="display:none; padding: 0.8rem 2rem; font-size: 1.1rem; margin-top: 1.5rem; background-color: #28a745; color: white; border: none; border-radius: 4px;">Complete! 🎉</button>
    `;

  const installBtn = document.getElementById("install-qiskit");
  const statusText = document.getElementById("installation-status");
  const warningText = document.getElementById("warning-message");
  const finishBtn = document.getElementById("finish-tutorial");
  const progressContainer = document.getElementById("progress-container");
  const progressBar = document.getElementById("progress-bar");
  const installLog = document.getElementById("installation-log");
  const venvSelector = document.getElementById("venv-selector");
  const selectedPathDiv = document.getElementById("selected-path");
  const venvPathText = document.getElementById("venv-path");

  let currentVenvPath = null;

  // Check virtual environment path
  function checkVenvPath() {
    // Check path saved from Step 2
    if (window.qeduContext && window.qeduContext.venvPath) {
      currentVenvPath = window.qeduContext.venvPath;
      venvPathText.textContent = currentVenvPath;
      selectedPathDiv.style.display = "block";
      venvSelector.style.display = "none";
    } else {
      // Show selection options if no path
      venvSelector.style.display = "block";
      selectedPathDiv.style.display = "none";
    }
  }

  checkVenvPath();

  // Select virtual environment folder
  document.getElementById("select-venv").addEventListener("click", async () => {
    const folderPath = await openFolder();
    if (folderPath) {
      currentVenvPath = folderPath;
      venvPathText.textContent = currentVenvPath;
      selectedPathDiv.style.display = "block";
      venvSelector.style.display = "none";
      
      // Save to global context
      if (!window.qeduContext) window.qeduContext = {};
      window.qeduContext.venvPath = currentVenvPath;
    }
  });

  // Use default path
  document.getElementById("use-default").addEventListener("click", () => {
    currentVenvPath = "./venv";
    venvPathText.textContent = currentVenvPath;
    selectedPathDiv.style.display = "block";
    venvSelector.style.display = "none";
    
    // Save to global context
    if (!window.qeduContext) window.qeduContext = {};
    window.qeduContext.venvPath = currentVenvPath;
  });

  // Documentation links
  document.getElementById("open-hello-world").addEventListener("click", () => {
    openExternal("https://docs.quantum.ibm.com/start/hello-world");
  });

  document.getElementById("open-tutorials").addEventListener("click", () => {
    openExternal("https://learning.quantum.ibm.com/catalog/tutorials");
  });

  document.getElementById("open-textbook").addEventListener("click", () => {
    openExternal("https://qiskit.org/learn");
  });

  document.getElementById("open-api-docs").addEventListener("click", () => {
    openExternal("https://docs.quantum.ibm.com/api/qiskit");
  });

  // Example links
  document.getElementById("bell-state").addEventListener("click", (e) => {
    e.preventDefault();
    openExternal("https://docs.quantum.ibm.com/build/circuit-library#bell-state");
  });

  document.getElementById("quantum-teleport").addEventListener("click", (e) => {
    e.preventDefault();
    openExternal("https://learning.quantum.ibm.com/tutorial/quantum-teleportation");
  });

  document.getElementById("grover-algo").addEventListener("click", (e) => {
    e.preventDefault();
    openExternal("https://learning.quantum.ibm.com/tutorial/grovers-algorithm");
  });

  document.getElementById("vqe-example").addEventListener("click", (e) => {
    e.preventDefault();
    openExternal("https://learning.quantum.ibm.com/tutorial/variational-quantum-eigensolver");
  });

  // Install button
  installBtn.addEventListener("click", async () => {
    if (!currentVenvPath) {
      warningText.textContent = "Please select a virtual environment path first!";
      warningText.style.color = "#dc3545";
      return;
    }

    statusText.textContent = "📦 Starting package installation...";
    statusText.style.color = "#007bff";
    warningText.textContent = "";
    installBtn.disabled = true;
    
    // Show progress
    progressContainer.style.display = "block";
    installLog.textContent = "Starting installation...\n";
    
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      if (progressValue < 90) {
        progressValue += Math.random() * 5;
        progressBar.style.width = Math.min(progressValue, 90) + "%";
      }
    }, 500);

    try {
      // Real-time progress callback
      const progressCallback = ({ type, data }) => {
        installLog.textContent += data;
        installLog.scrollTop = installLog.scrollHeight;
        
        // Update progress based on keywords
        if (data.includes("Collecting")) {
          progressValue = Math.min(progressValue + 5, 85);
          progressBar.style.width = progressValue + "%";
        } else if (data.includes("Installing")) {
          progressValue = Math.min(progressValue + 3, 95);
          progressBar.style.width = progressValue + "%";
        }
      };

      await qiskitInstaller.installQiskit(currentVenvPath, progressCallback);
      
      clearInterval(progressInterval);
      progressBar.style.width = "100%";
      progressBar.style.backgroundColor = "#28a745";
      
      statusText.textContent = "✅ All packages successfully installed!";
      statusText.style.color = "#28a745";
      statusText.style.fontWeight = "bold";
      
      warningText.innerHTML = `
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
          <p style="margin: 0; color: #155724; font-weight: bold;">🎉 Installation Complete!</p>
          <p style="margin: 0.5rem 0 0 0; color: #155724;">Qiskit and related packages have been installed to ${currentVenvPath}.</p>
          <p style="margin: 0.5rem 0 0 0; color: #155724;">You're now ready to start quantum computing!</p>
        </div>
      `;

      installLog.textContent += "\n\n=== Installation Complete ===\n";
      installLog.textContent += "✅ qiskit\n";
      installLog.textContent += "✅ qiskit-ibm-runtime\n";
      installLog.textContent += "✅ matplotlib\n";
      installLog.textContent += "✅ pylatexenc\n";
      
      finishBtn.style.display = "inline-block";
    } catch (error) {
      clearInterval(progressInterval);
      progressBar.style.backgroundColor = "#dc3545";
      
      statusText.textContent = "❌ Package installation failed";
      statusText.style.color = "#dc3545";
      
      warningText.innerHTML = `
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 1rem; margin-top: 1rem;">
          <p style="margin: 0; color: #721c24; font-weight: bold;">An error occurred during installation:</p>
          <p style="margin: 0.5rem 0 0 0; color: #721c24;">${error.message}</p>
        </div>
      `;
      
      installLog.textContent += `\n\n=== Error Occurred ===\n${error.message}\n`;
      installBtn.disabled = false;
    }
  });

  finishBtn.addEventListener("click", () => {
    warningText.innerHTML = `
      <div style="background-color: #cff4fc; border: 2px solid #0dcaf0; border-radius: 8px; padding: 1.5rem; margin-top: 1.5rem; text-align: center;">
        <h2 style="margin: 0 0 0.8rem 0; color: #055160;">🚀 Qiskit Installation Complete!</h2>
        <p style="margin: 0 0 0.8rem 0; color: #055160; font-size: 1.05rem;">Congratulations! You're ready to begin your quantum computing journey.</p>
        <p style="margin: 0; color: #055160;">Use the documentation and examples above to write your first quantum program!</p>
      </div>
    `;
  });
};