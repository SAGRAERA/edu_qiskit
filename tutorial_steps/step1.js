module.exports = function stepPythonChecker(context) {
  const { pythonChecker, openExternal, loadStep } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container" style="margin-bottom: 1rem; margin-top: -1rem;">
            <canvas class="canvas"></canvas>
            <p style="font-size: 1.2rem; margin-top: 0.5rem; font-weight: bold;">Step 1 of 4</p>
        </div>
        
        <h1 style="margin-bottom: 1.5rem;">Check Python Installation</h1>
        
        <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
            <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ IMPORTANT: When installing Python, make sure to check "Add Python to PATH"!</p>
            <p style="margin: 0.5rem 0 0 0; color: #856404;">Without this option, Python won't be accessible from the command prompt.</p>
        </div>
        
        <button id="check-python" style="margin-bottom: 1.5rem; padding: 0.8rem 2rem; font-size: 1.1rem;">Check Python Installation</button>
        
        <p id="python-status" style="margin-bottom: 1.5rem; font-size: 1.1rem;">Click to Check</p>
        
        <p id="warning-message" style="margin-top: 2rem;"></p>
    `;

  const checkButton = document.getElementById("check-python");
  const statusText = document.getElementById("python-status");
  const warningText = document.getElementById("warning-message");

  checkButton.addEventListener("click", async () => {
    // const pythonStatus = await window.api.checkPythonInstalled();
    const pythonStatus = await pythonChecker.checkPythonInstalled();

    // pythonStatus.installed = false;

    if (pythonStatus.installed) {
      statusText.textContent = `Python Installed: ${pythonStatus.version}`;
      warningText.textContent = "You can click to next step button";

      const nextStepBtn = document.createElement("button");
      nextStepBtn.textContent = "Next Step";
      warningText.appendChild(document.createElement("br"));
      warningText.appendChild(nextStepBtn);
      nextStepBtn.addEventListener("click", () => {
        loadStep("step2");
      });
    } else {
      statusText.textContent = "Python is not installed.";

      const installBtn = document.createElement("button");
      installBtn.textContent = "Go to Python Download Page";
      warningText.textContent =
        "!!  When you install Python, you MUST check path-env option  !!";

      statusText.appendChild(document.createElement("br"));
      statusText.appendChild(installBtn);
      statusText.appendChild(document.createElement("br"));

      installBtn.addEventListener("click", () => {
        openExternal("https://www.python.org/downloads");

        statusText.textContent =
          "After Installation, Please Click Re-check Button";

        const reCheckBtn = document.createElement("button");
        reCheckBtn.textContent = "Re-Check Python Installation";
        statusText.appendChild(document.createElement("br"));
        statusText.appendChild(reCheckBtn);

        reCheckBtn.addEventListener("click", () => {
          if (pythonStatus.installed) {
            statusText.textContent = `Python Installed: ${pythonStatus.version}`;

            const nextStepBtn = document.createElement("button");
            nextStepBtn.textContent = "Next Step";

            warningText.appendChild(document.createElement("br"));
            warningText.appendChild(nextStepBtn);

            nextStepBtn.addEventListener("click", () => {
              loadStep("step2");
            });
          } else {
            statusText.textContent = "Python is still not installed yet.";
          }
        });
      });
    }
  });
};
