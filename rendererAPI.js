import { QuantumAPI } from "./customAPI.js";

const api = new QuantumAPI();

export function renderAPIUi() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <h1>User API Data</h1>
    <p>You can get your IBM Quantum Status data.</p>
    <p>Enter your IBM Quantum Token here.</p>
    <input type="text" id="token-input" placeholder="IBM Quantum Token" />
    <button id="save-token">Save Token</button>
    <button id="get-info">Get User's Information</button>
    <div id="results" style="margin-top:1rem;"></div>
    `;

  const tokenInput = document.getElementById("token-input");
  const saveTokenBtn = document.getElementById("save-token");
  const getInfoBtn = document.getElementById("get-info");
  const resultArea = document.getElementById("results");

  saveTokenBtn.addEventListener("click", () => {
    const token = tokenInput.value.trim();
    api.setToken(token);
    alert("Token saved!");
  });

  getInfoBtn.addEventListener("click", async () => {
    resultArea.textContent = "Loading info...";
    try {
      const data = await api.getInfo();
      resultArea.innerHTML = formatInfoAsHTML(data);
    } catch (error) {
      resultArea.textContent = error;
    }
  });
}

function formatInfoAsHTML(data) {
  const { UserInfo = {}, Usages = {}, Backends = {} } = data;

  const instancesList = (UserInfo.instances || [])
    .map((inst) => `<li>${inst.name} (plan:${inst.plan})</li>`)
    .join("");

  const userInfoHTML = `
    <h2>User Info</h2>
    <p><strong>Email:</strong> ${UserInfo.email || "N/A"}</p>
    <p>Instances:</p>
    <ul>${instancesList}</ul>

    `;

  const periodStart = Usages?.period?.start || "N/A";
  const periodEnd = Usages?.period?.end || "N/A";

  const usageList = (Usages.byInstance || [])
    .map(
      (item) =>
        `<li>
          <strong>${item.instance}</strong> 
          => usage: ${item.usage}/${item.quota}, 
          pendingJobs: ${item.pendingJobs}
        </li>`
    )
    .join("");

  const usageHTML = `
    <h2>Usage</h2>
    <p>Period: ${periodStart} ~ ${periodEnd}</p>
    <ul>${usageList}</ul>
  `;

  const devices = Backends.devices || [];
  const backendsRows = devices
    .map(
      (dev) => `
      <tr>
        <td>${dev.deviceID}</td>
        <td>${dev.state}</td>
        <td>${dev.status}</td>
        <td>${dev.message || ""}</td>
        <td>${dev.length_queue}</td>
        <td>${dev.backend_version}</td>
      </tr>
    `
    )
    .join("");

  const backendsHTML = `
    <h2>Backends</h2>
    <table border="1" cellspacing="0" cellpadding="4">
      <thead>
        <tr>
          <th>Device ID</th>
          <th>State</th>
          <th>Status</th>
          <th>Message</th>
          <th>Queue</th>
          <th>Version</th>
        </tr>
      </thead>
      <tbody>
        ${backendsRows}
      </tbody>
    </table>
  `;

  return userInfoHTML + usageHTML + backendsHTML;
}
