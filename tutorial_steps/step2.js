module.exports = function stepSetupVirtualEnv(context) {
  const { vEnvSetup, loadStep, openFolder } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
    <div class="container" style="margin-bottom: 1rem; margin-top: -1rem;">
      <canvas class="canvas"></canvas>
      <p style="font-size: 1.2rem; margin-top: 0.5rem; font-weight: bold;">Step 2 of 4</p>
    </div>
    
    <h1 style="margin-bottom: 1.5rem;">Configure Virtual Environment</h1>

    <div id="choice-container" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
      <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem;">Choose how to set up your virtual environment:</p>
      <div style="margin-bottom: 0.8rem;">
        <input type="radio" name="setup-type" value="auto" id="auto-radio">
        <label for="auto-radio" style="font-size: 1.05rem; margin-left: 0.5rem;">Automatic (Create in ./venv folder)</label>
      </div>
      <div>
        <input type="radio" name="setup-type" value="manual" id="manual-radio">
        <label for="manual-radio" style="font-size: 1.05rem; margin-left: 0.5rem;">Manual (Select folder)</label>
      </div>
    </div>

    <button id="setup-venv" style="margin-bottom: 1.5rem; padding: 0.8rem 2rem; font-size: 1.1rem;">Setup Virtual Environment</button>
    
    <p id="venv-status" style="margin-bottom: 1.5rem; font-size: 1.1rem;">Please select an option above first</p>

    <p id="warning-message" style="margin-top: 2rem;"></p>

    <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 1.5rem; margin-top: 2rem;">
      <p style="margin: 0 0 1rem 0; font-weight: bold;">Already have a virtual environment?</p>
      <button id="skip" style="padding: 0.6rem 1.5rem; font-size: 1rem;">Skip This Step →</button>
      <p id="skip-message" style="margin-top: 0.5rem; color: #666;">If you've already configured a Python virtual environment, skip this step.</p>
    </div>
  `;

  const setupButton = document.getElementById("setup-venv");
  const statusText = document.getElementById("venv-status");
  const warningText = document.getElementById("warning-message");
  const skipButton = document.getElementById("skip");

  setupButton.addEventListener("click", async () => {
    statusText.textContent = "Setting up virtual environment...";

    const selectedRadio = document.querySelector(
      `input[name="setup-type"]:checked`
    );

    if (!selectedRadio) {
      warningText.textContent =
        "You must choose an option (Automatic / Manual) first.";
      return;
    }

    if (selectedRadio.value === "auto") {
      statusText.textContent = "Setting up virtual environment (Auto) ...";
      try {
        await vEnvSetup.createVEnv("./venv");
        statusText.textContent = "✅ Automatically created venv at ./venv !";
        statusText.style.color = "#28a745";
        
        // 가상환경 경로를 전역 context에 저장
        if (!window.qeduContext) window.qeduContext = {};
        window.qeduContext.venvPath = "./venv";

        const nextStepBtn = document.createElement("button");
        nextStepBtn.textContent = "Next Step →";
        nextStepBtn.style.padding = "0.8rem 2rem";
        nextStepBtn.style.fontSize = "1.1rem";
        nextStepBtn.style.backgroundColor = "#28a745";
        nextStepBtn.style.color = "white";
        nextStepBtn.style.border = "none";
        nextStepBtn.style.borderRadius = "4px";
        nextStepBtn.style.cursor = "pointer";

        warningText.appendChild(document.createElement("br"));
        warningText.appendChild(nextStepBtn);

        nextStepBtn.addEventListener("click", () => {
          loadStep("step3");
        });
      } catch (error) {
        warningText.textContent =
          "Failed to create virtual environment: " + error;
        warningText.style.color = "#dc3545";
        return;
      }
    } else if (selectedRadio.value === "manual") {
      try {
        const folderPath = await openFolder();

        if (!folderPath) {
          statusText.textContent = "Canceled manual setup.";
          return;
        }

        const venvPath = folderPath + "/venv";
        await vEnvSetup.createVEnv(venvPath);
        statusText.textContent = `✅ Manually created venv at: ${venvPath}`;
        statusText.style.color = "#28a745";
        
        // 가상환경 경로를 전역 context에 저장
        if (!window.qeduContext) window.qeduContext = {};
        window.qeduContext.venvPath = venvPath;

        const nextStepBtn = document.createElement("button");
        nextStepBtn.textContent = "Next Step →";
        nextStepBtn.style.padding = "0.8rem 2rem";
        nextStepBtn.style.fontSize = "1.1rem";
        nextStepBtn.style.backgroundColor = "#28a745";
        nextStepBtn.style.color = "white";
        nextStepBtn.style.border = "none";
        nextStepBtn.style.borderRadius = "4px";
        nextStepBtn.style.cursor = "pointer";

        warningText.appendChild(document.createElement("br"));
        warningText.appendChild(nextStepBtn);

        nextStepBtn.addEventListener("click", () => {
          loadStep("step3");
        });
      } catch (error) {
        warningText.textContent =
          "Failed to create virtual environment: " + error;
        warningText.style.color = "#dc3545";
        return;
      }
    }
  });

  skipButton.addEventListener("click", async () => {
    loadStep("step3");
  });
};
