module.exports = function stepPythonChecker(context) {
  const { pythonChecker, openExternal, loadStep } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
        <div class="container">
            <canvas class="canvas"></canvas>
            <p>Steps (1/4)</p>
        </div>
        <h1>Step 1: Check Python Installation</h1>
        <button id="check-python">Check Python Installation</button>
        <p id="python-status">Click to Check</p>
        <p id="warning-message"></p>
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
