import { QuantumAPIv3 } from "./quantumAPIv3.js";

const api = new QuantumAPIv3();

export function renderAPIUi() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="card">
      <h1>IBM Quantum API Dashboard</h1>
      <p>Connect to IBM Quantum to view your account status and available backends.</p>
      <div style="margin-top: 1rem;">
        <p><strong>Get your token from:</strong></p>
        <ul>
          <li><a href="#" id="ibm-quantum-link" style="color: var(--primary-color);">quantum-computing.ibm.com</a> - IBM Quantum Platform Token</li>
          <li><a href="#" id="ibm-cloud-link" style="color: var(--primary-color);">cloud.ibm.com</a> - IBM Cloud API Key</li>
        </ul>
      </div>
      
      <div style="margin-top: 2rem;">
        <input type="password" id="token-input" placeholder="Enter your IBM Quantum Token or IBM Cloud API Key" />
        <input type="text" id="crn-input" style="margin-top: 0.5rem;" placeholder="Enter your CRN (e.g., crn:v1:bluemix:public:quantum-computing:us-east:...)" />
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
          CRN format: crn:v1:bluemix:public:quantum-computing:region:a/account-id:instance-id::
        </p>
        <div style="margin-top: 1rem; display: flex; gap: 1rem;">
          <button id="save-token" class="primary">Save Credentials</button>
          <button id="test-connection" class="secondary">Test Connection</button>
          <button id="get-info" class="success">Get Full Information</button>
          <button id="transpile-service" class="secondary">Transpile Service</button>
        </div>
      </div>
      
      <div id="connection-status" style="margin-top: 1rem;"></div>
    </div>
    <div id="results" style="margin-top:1rem;"></div>
    `;

  const tokenInput = document.getElementById("token-input");
  const crnInput = document.getElementById("crn-input");
  const saveTokenBtn = document.getElementById("save-token");
  const getInfoBtn = document.getElementById("get-info");
  const transpileBtn = document.getElementById("transpile-service");
  const resultArea = document.getElementById("results");

  const testConnectionBtn = document.createElement('button');
  testConnectionBtn.id = 'test-connection';
  const connectionStatus = document.getElementById('connection-status');
  
  document.getElementById('ibm-quantum-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.api.openExternalLink('https://quantum-computing.ibm.com');
  });
  
  document.getElementById('ibm-cloud-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.api.openExternalLink('https://cloud.ibm.com');
  });
  
  document.getElementById('test-connection').addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const crn = crnInput.value.trim();
    
    if (!token) {
      connectionStatus.innerHTML = '<div class="error-message">Please enter a token first</div>';
      return;
    }
    
    // Set CRN if provided
    if (crn) {
      api.setInstanceCRN(crn);
    }
    
    // Only set token if it's different or not set yet
    if (api.apiKey !== token) {
      await api.setToken(token);
    }
    
    connectionStatus.innerHTML = '<div class="loading-spinner"></div><p>Testing connection...</p>';
    
    const result = await api.testConnection();
    if (result.success) {
      connectionStatus.innerHTML = '<div class="success-message">✅ Connection successful!</div>';
    } else {
      connectionStatus.innerHTML = `<div class="error-message">❌ Connection failed: ${result.message}</div>`;
    }
  });
  
  saveTokenBtn.addEventListener("click", async () => {
    const token = tokenInput.value.trim();
    const crn = crnInput.value.trim();
    
    if (!token) {
      connectionStatus.innerHTML = '<div class="error-message">Please enter a token</div>';
      return;
    }
    
    if (crn) {
      api.setInstanceCRN(crn);
      localStorage.setItem('ibm_quantum_crn', crn);
    }
    
    const validation = await api.setToken(token);
    
    if (validation.valid) {
      connectionStatus.innerHTML = '<div class="success-message">✅ Credentials saved and validated!</div>';
      localStorage.setItem('ibm_quantum_token', token);
    } else {
      connectionStatus.innerHTML = `<div class="error-message">❌ Invalid token: ${validation.error}</div>`;
    }
  });

  getInfoBtn.addEventListener("click", async () => {
    if (!api.bearerToken) {
      connectionStatus.innerHTML = '<div class="error-message">Please save a token first</div>';
      return;
    }
    
    resultArea.innerHTML = '<div class="loading-spinner"></div><p>Loading comprehensive information...</p>';
    
    try {
      const data = await api.getInfo();
      resultArea.innerHTML = formatInfoAsHTML(data);
    } catch (error) {
      resultArea.innerHTML = `
        <div class="error-dialog">
          <div class="error-header">
            <span class="error-icon">⚠️</span>
            <h3>Failed to Load Information</h3>
          </div>
          <div class="error-body">
            <p class="error-message">${error.message}</p>
            <p class="error-action">Please check your token and internet connection.</p>
          </div>
        </div>
      `;
    }
  });
  
  transpileBtn.addEventListener("click", async () => {
    if (!api.bearerToken) {
      connectionStatus.innerHTML = '<div class="error-message">Please save a token first to use the Transpile Service</div>';
      return;
    }
    
    const { renderTranspilerUI } = await import("./transpilerUI.js");
    renderTranspilerUI();
  });
  
  // Load saved credentials if available
  const savedToken = localStorage.getItem('ibm_quantum_token');
  const savedCRN = localStorage.getItem('ibm_quantum_crn');
  
  if (savedToken) {
    tokenInput.value = savedToken;
    api.setToken(savedToken);
  }
  
  if (savedCRN) {
    crnInput.value = savedCRN;
    api.setInstanceCRN(savedCRN);
  }
  
  if (savedToken || savedCRN) {
    connectionStatus.innerHTML = '<div class="info-message">Credentials loaded from previous session</div>';
  }
}

function formatInfoAsHTML(data) {
  const { UserInfo = {}, Jobs = {}, Backends = [], Features = {} } = data;

  const instancesList = (UserInfo.instances || [])
    .map((inst) => {
      if (typeof inst === 'string') {
        return `<li><small>${inst}</small></li>`;
      }
      return `<li><strong>${inst.name || inst}</strong><br><small>${inst.crn || inst.id || ''}</small></li>`;
    })
    .join("");

  const userInfoHTML = `
    <div class="card">
      <h2>IBM Quantum Account</h2>
      ${UserInfo.email ? `<p><strong>Email:</strong> ${UserInfo.email}</p>` : ''}
      <h3>Instances</h3>
      <ul>${instancesList || '<li>No instances available</li>'}</ul>
      ${UserInfo.currentCRN ? `<p><strong>Current CRN:</strong> <small>${UserInfo.currentCRN}</small></p>` : ''}
    </div>
    `;

  const jobsHTML = `
    <div class="card">
      <h2>Your Recent Jobs</h2>
      <table class="info-table">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Status</th>
            <th>Backend</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${Jobs.recent?.map(job => `
            <tr>
              <td class="job-id">${job.id}</td>
              <td>
                <span class="job-status ${job.status?.toLowerCase() || 'queued'}">
                  ${job.status || 'QUEUED'}
                </span>
              </td>
              <td>
                <div class="backend-name">
                  <span class="backend-icon">💻</span>
                  <span>${job.backend || 'N/A'}</span>
                </div>
              </td>
              <td>${job.created ? new Date(job.created).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}</td>
            </tr>
          `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No recent jobs found</td></tr>'}
        </tbody>
      </table>
      <p style="margin-top: 1rem; font-weight: 600;">Total jobs in history: ${Jobs.total || 0}</p>
    </div>
  `;

  const backendsRows = Backends
    .map(
      (dev) => `
      <tr>
        <td>
          <div class="backend-name">
            <span class="backend-icon">🖥️</span>
            <span>${dev.name}</span>
          </div>
        </td>
        <td>
          <span class="status-badge ${dev.operational ? 'active' : 'inactive'}">
            ${dev.status}
          </span>
        </td>
        <td class="operational-status">
          <span class="${dev.operational ? 'operational-yes' : 'operational-no'}">
            ${dev.operational ? '✅' : '❌'}
          </span>
        </td>
        <td>
          <div class="queue-info">
            <span class="queue-count">${dev.pending_jobs || 0} jobs</span>
            <span class="queue-time">${dev.estimated_queue_time || 'N/A'}</span>
          </div>
        </td>
        <td class="qubit-count">${dev.n_qubits || 'N/A'}</td>
        <td>${dev.simulator ? '🔬 Simulator' : '⚛️ Real'}</td>
        <td>${dev.processor_type || 'N/A'}</td>
      </tr>
    `
    )
    .join("");

  const backendsHTML = `
    <div class="card">
      <h2>Available Quantum Backends</h2>
      <table class="info-table">
        <thead>
          <tr>
            <th>Backend Name</th>
            <th>Status</th>
            <th>Operational</th>
            <th>Queue Info</th>
            <th>Qubits</th>
            <th>Type</th>
            <th>Processor</th>
          </tr>
        </thead>
        <tbody>
          ${backendsRows || '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No backends available</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  const featuresHTML = `
    <div class="card">
      <h2>Connection Status</h2>
      <table>
        <tr>
          <td><strong>API Access:</strong></td>
          <td>${Features.hasAccess ? '<span class="badge badge-success">Connected</span>' : '<span class="badge badge-error">Not Connected</span>'}</td>
        </tr>
        <tr>
          <td><strong>Token Status:</strong></td>
          <td>${Features.tokenValid ? '<span class="badge badge-success">Valid</span>' : '<span class="badge badge-error">Invalid</span>'}</td>
        </tr>
      </table>
    </div>
  `;

  return userInfoHTML + jobsHTML + backendsHTML + featuresHTML;
}
