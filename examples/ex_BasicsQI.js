export default function renderBasicsQIExample() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const tutorialUrl =
    "https://learning.quantum.ibm.com/course/basics-of-quantum-information";

  mainContent.innerHTML = `
    <h1>Basics of Quantum Information</h1>
    <p>
      This example provides a link to an external tutorial about quantum information basics.
      Click the button below to open the tutorial.
    </p>
    <button id="open-qi-link">Open Tutorial</button>
  `;

  const openQiLinkBtn = document.getElementById("open-qi-link");

  openQiLinkBtn.addEventListener("click", () => {
    window.api.openExternalLink(tutorialUrl);
  });
}
