module.exports = function stepInstallQiskit(context) {
  const { loadStep, openExternal, qiskitInstaller } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container">
            <canvas class="canvas"></canvas>
            <p>Steps (4/4)</p>
        </div>
        <h1>Step 4: Install Qiskit in your Python Environment using VSCode</h1>
        <button id="install-qiskit">Install Qiskit</button>
        <p id="installation-status">Click to Install Qiskit at your venv</p>
        <p id="warning-message"></p>

        <p>\n\n</p>
        <button id="open-docs">Open Qiskit Docs</button>
        <p>Would you like to take a look at the Qiskit documentation while you wait for the installation to complete?</p>
        <button id="finish-tutorial" style="display:none;">Finish Tutorial</button>

    `;

  const installBtn = document.getElementById("install-qiskit");
  const statusText = document.getElementById("installation-status");
  const warningText = document.getElementById("warning-message");
  const finishBtn = document.getElementById("finish-tutorial");
  const docsBtn = document.getElementById("open-docs");

  docsBtn.addEventListener("click", () => {
    openExternal("https://quantum.cloud.ibm.com/docs/en/guides/hello-world");
  });

  installBtn.addEventListener("click", async () => {
    statusText.textContent = "Install Qiskit...";
    warningText.textContent = "";

    try {
      let venvPath = context.venvPath;

      if (!venvPath) {
        warningText.textContent = "qiskit will be installed at ./venv ";
        venvPath = "./venv";
      }
      console.log(venvPath);
      await qiskitInstaller.installQiskit(venvPath);
      statusText.textContent = "Qiskit installation completed successfully!";
      warningText.textContent = `Qiskit is now installed in ${venvPath}!`;

      finishBtn.style.display = "inline-block";
    } catch (error) {
      statusText.textContent = "Qiskit installation failed";
      warningText.textContent = `Error: ${error}`;
    }
  });

  finishBtn.addEventListener("click", () => {
    warningText.textContent = "Tutorial is finished.";
  });
};
