module.exports = function stepVSCodeChecker(context) {
  const { vsCodeChecker, openExternal, loadStep } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container" style="margin-bottom: 1rem; margin-top: -1rem;">
            <canvas class="canvas"></canvas>
            <p style="font-size: 1.2rem; margin-top: 0.5rem; font-weight: bold;">Step 3 of 4</p>
        </div>
        
        <h1 style="margin-bottom: 1.5rem;">Check VSCode Installation</h1>
        
        <button id="check-vscode" style="margin-bottom: 1.5rem; padding: 0.8rem 2rem; font-size: 1.1rem;">Check Visual Studio Code Installation</button>
        
        <p id="vscode-status" style="margin-bottom: 1.5rem; font-size: 1.1rem;">Click to Check</p>
        
        <p id="warning-message" style="margin-top: 2rem;"></p>
    `;

  const checkButton = document.getElementById("check-vscode");
  const statusText = document.getElementById("vscode-status");
  const warningText = document.getElementById("warning-message");

  checkButton.addEventListener("click", async () => {
    let vscodeStatus;
    try {
      vscodeStatus = await vsCodeChecker.checkVSCodeInstalled();
    } catch (err) {
      vscodeStatus = { installed: false };
    }

    if (vscodeStatus.installed) {
      statusText.textContent = `Visual Studio Code Installed: ${
        vscodeStatus.version || ""
      }`;
      warningText.textContent =
        "Visual Studio Code is already installed. Please go to the next step.";

      const nextStepBtn = document.createElement("button");
      nextStepBtn.textContent = "Next Step";
      warningText.appendChild(document.createElement("br"));
      warningText.appendChild(nextStepBtn);

      nextStepBtn.addEventListener("click", () => {
        loadStep("step4");
      });
    } else {
      statusText.textContent = "VSCode is not installed.";

      const installBtn = document.createElement("button");
      installBtn.textContent = "Go to Visual Studio Code Download Page";
      warningText.textContent =
        "Visual Studio Code is not installed. Please Click to go to download page.";

      statusText.appendChild(document.createElement("br"));
      statusText.appendChild(installBtn);

      installBtn.addEventListener("click", () => {
        openExternal("https://code.visualstudio.com/download");

        statusText.textContent =
          "After Installation, Please Click Re-check Button";

        const reCheckBtn = document.createElement("button");
        reCheckBtn.textContent = "Re-Check Visual Studio Code Installation";
        statusText.appendChild(document.createElement("br"));
        statusText.appendChild(reCheckBtn);

        reCheckBtn.addEventListener("click", () => {
          if (pythonStatus.installed) {
            statusText.textContent = `Visual Studio Code Installed: ${vscodeStatus.version}`;

            const nextStepBtn = document.createElement("button");
            nextStepBtn.textContent = "Next Step";

            warningText.appendChild(document.createElement("br"));
            warningText.appendChild(nextStepBtn);

            nextStepBtn.addEventListener("click", () => {
              loadStep("step4");
            });
          } else {
            statusText.textContent =
              "Visual Studio Code is still not installed yet.";
          }
        });
      });
    }
  });
};
