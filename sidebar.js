import { QuantumAPIv3 } from "./quantumAPIv3.js";
import { renderAPIUi } from "./rendererAPI.js";

const api = new QuantumAPIv3();

export function renderSidebar(context) {
  const sidebar = document.createElement("div");
  sidebar.classList.add("sidebar");

  const title = document.createElement("h2");
  title.textContent = "Menu";
  sidebar.appendChild(title);

  const btnHome = document.createElement("button");
  btnHome.textContent = "Home";
  btnHome.addEventListener("click", () => {
    renderHome(context);
  });
  sidebar.appendChild(btnHome);

  const btnTutorial = document.createElement("button");
  btnTutorial.textContent = "Installation Tutorial";
  btnTutorial.addEventListener("click", () => {
    window.api.loadStep("step1");
  });
  sidebar.appendChild(btnTutorial);

  const btnExample = document.createElement("button");
  btnExample.textContent = "Examples";
  btnExample.addEventListener("click", () => {
    renderExamples(context);
  });
  sidebar.appendChild(btnExample);

  const btnCustom = document.createElement("button");
  btnCustom.textContent = "IBM Quantum API";
  btnCustom.addEventListener("click", () => {
    renderAPIUi();
  });
  sidebar.appendChild(btnCustom);

  return sidebar;
}

export function renderHome(context) {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h1>Guide of How to Set Qiskit Environment</h1>
    <p>Please use the sidebar to navigate</p>
    `;
}

function renderExamples(context) {
  // Load the examples page from tutorial_steps
  window.api.loadStep("examples");
}
