module.exports = function stepSetupVirtualEnv(context) {
  const { vEnvSetup, loadStep, openFolder } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
    <div class="container">
      <canvas class="canvas"></canvas>
      <p>Steps (2/4)</p>
    </div>
    <h1>Step 2: Configure Virtual Environment</h1>

    <button id="setup-venv">Setup Virtual Environment</button>
    <p id="venv-status">Click to Set up</p>

    <p id="warning-message"></p>

    <button id="skip">Skip Button</button>
    <p id="skip-message">If you already make your own python environment, please skip this step.</p>

    <div id="choice-container" style="margin-top: 1rem, display: none;">
      <p>Please choose how you want to create the virtual environment:</p>
      <input type="radio", name="setup-type" value="auto"> Automatic (./venv)
      <input type="radio", name="setup-type" value="manual"> Manual (Select a Folder)
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
        statusText.textContent = "Automatically created venv at ./venv !";

        const nextStepBtn = document.createElement("button");
        nextStepBtn.textContent = "Next Step";

        warningText.appendChild(document.createElement("br"));
        warningText.appendChild(nextStepBtn);

        nextStepBtn.addEventListener("click", () => {
          loadStep("step2");
        });
      } catch (error) {
        warningText.textContent =
          "Failed to create virtual environment" + error;
        return;
      }
    } else if (selectedRadio.value === "manual") {
      try {
        const folderPath = await openFolder();

        if (!folderPath) {
          statusText.textContent = "Canceled manual setup.";
          return;
        }

        context.venvPath = folderPath;

        await vEnvSetup.createVEnv(folderPath);
        statusText.textContent = `Manually created venv at: ${folderPath}`;

        const nextStepBtn = document.createElement("button");
        nextStepBtn.textContent = "Next Step";

        warningText.appendChild(document.createElement("br"));
        warningText.appendChild(nextStepBtn);

        nextStepBtn.addEventListener("click", () => {
          loadStep("step2");
        });
      } catch (error) {
        warningText.textContent =
          "Failed to create virtual environment" + error;
        return;
      }
    }
  });

  skipButton.addEventListener("click", async () => {
    loadStep("step3");
  });
};
