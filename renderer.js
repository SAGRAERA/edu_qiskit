import { renderSidebar, renderHome } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");

  const context = {
    loadStep: (stepName) => window.api.loadStep(stepName),
  };
  const sidebar = renderSidebar(context);

  app.appendChild(sidebar);

  const mainContent = document.createElement("div");
  mainContent.id = "main-content";
  mainContent.classList.add("main-content");

  app.appendChild(mainContent);

  renderHome(context);
});
