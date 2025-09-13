import { QuantumAPIv3 } from "./quantumAPIv3.js";

const api = new QuantumAPIv3();

export function renderTranspilerUI() {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div class="card">
            <h1>Qiskit Transpiler Service</h1>
            <p>Optimize your quantum circuits using IBM's cloud-based transpiler with AI enhancement.</p>
            <div class="badge badge-info">Premium Feature</div>
            
            <div style="margin-top: 2rem;">
                <h3>Circuit Input</h3>
                <textarea id="circuit-input" placeholder="Enter your QASM circuit or OpenQASM code here..." 
                    style="width: 100%; height: 200px; font-family: 'Fira Code', monospace;"></textarea>
                
                <div style="margin-top: 1rem;">
                    <h3>Transpilation Options</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label for="backend-select">Target Backend:</label>
                            <select id="backend-select">
                                <option value="">Loading backends...</option>
                            </select>
                        </div>
                        
                        <div>
                            <label for="optimization-level">Optimization Level:</label>
                            <select id="optimization-level">
                                <option value="0">0 - No optimization</option>
                                <option value="1" selected>1 - Light optimization</option>
                                <option value="2">2 - Medium optimization</option>
                                <option value="3">3 - Heavy optimization</option>
                            </select>
                        </div>
                        
                        <div style="grid-column: span 2;">
                            <label>
                                <input type="checkbox" id="use-ai" checked>
                                Enable AI-powered transpilation (recommended)
                            </label>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button id="transpile-btn" class="primary">Transpile Circuit</button>
                    <button id="estimate-btn" class="secondary">Estimate Cost</button>
                    <button id="load-example" class="secondary">Load Example</button>
                </div>
            </div>
            
            <div id="transpiler-status" style="margin-top: 2rem;"></div>
            <div id="transpiler-results" style="margin-top: 1rem;"></div>
        </div>
    `;

    const circuitInput = document.getElementById('circuit-input');
    const backendSelect = document.getElementById('backend-select');
    const optimizationLevel = document.getElementById('optimization-level');
    const useAI = document.getElementById('use-ai');
    const transpileBtn = document.getElementById('transpile-btn');
    const estimateBtn = document.getElementById('estimate-btn');
    const loadExampleBtn = document.getElementById('load-example');
    const statusArea = document.getElementById('transpiler-status');
    const resultsArea = document.getElementById('transpiler-results');

    // Load available backends
    loadBackends();

    async function loadBackends() {
        try {
            const token = localStorage.getItem('ibm_quantum_token');
            if (!token) {
                statusArea.innerHTML = '<div class="warning-message">Please set your IBM Quantum token first in the User API Data section.</div>';
                return;
            }

            api.setToken(token);
            const instances = await api.getInstances();
            
            if (instances.length > 0) {
                const defaultInstance = instances.find(i => i.is_default) || instances[0];
                const backends = await api.getBackends(defaultInstance.id);
                
                backendSelect.innerHTML = '<option value="">Select a backend</option>';
                backends.devices.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.name;
                    option.textContent = `${device.name} (${device.n_qubits} qubits)`;
                    backendSelect.appendChild(option);
                });
            }
        } catch (error) {
            statusArea.innerHTML = `<div class="error-message">Failed to load backends: ${error.message}</div>`;
        }
    }

    loadExampleBtn.addEventListener('click', () => {
        circuitInput.value = `OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[0];
cx q[0], q[1];
cx q[1], q[2];
measure q -> c;`;
        statusArea.innerHTML = '<div class="info-message">Example GHZ state circuit loaded</div>';
    });

    transpileBtn.addEventListener('click', async () => {
        const circuit = circuitInput.value.trim();
        const backend = backendSelect.value;
        
        if (!circuit) {
            statusArea.innerHTML = '<div class="error-message">Please enter a circuit</div>';
            return;
        }
        
        if (!backend) {
            statusArea.innerHTML = '<div class="error-message">Please select a backend</div>';
            return;
        }

        transpileBtn.disabled = true;
        statusArea.innerHTML = '<div class="loading-spinner"></div><p>Transpiling circuit...</p>';
        resultsArea.innerHTML = '';

        try {
            const taskId = await api.transpile(circuit, backend, {
                optimizationLevel: parseInt(optimizationLevel.value),
                useAI: useAI.checked
            });

            statusArea.innerHTML = `<div class="info-message">Transpilation job submitted. Task ID: ${taskId}</div>`;
            
            // Poll for results
            let attempts = 0;
            const maxAttempts = 30;
            
            const pollInterval = setInterval(async () => {
                attempts++;
                
                try {
                    const result = await api.getTranspilationResult(taskId);
                    
                    if (result.status === 'completed' || result.transpiled_circuit) {
                        clearInterval(pollInterval);
                        displayTranspilationResults(result);
                        statusArea.innerHTML = '<div class="success-message">✅ Transpilation completed successfully!</div>';
                    } else if (result.status === 'failed') {
                        clearInterval(pollInterval);
                        statusArea.innerHTML = `<div class="error-message">Transpilation failed: ${result.error || 'Unknown error'}</div>`;
                    } else if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        statusArea.innerHTML = '<div class="warning-message">Transpilation is taking longer than expected. Please check back later.</div>';
                    } else {
                        statusArea.innerHTML = `<div class="info-message">Transpilation in progress... (${attempts}/${maxAttempts})</div>`;
                    }
                } catch (error) {
                    if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                        statusArea.innerHTML = `<div class="error-message">Failed to get results: ${error.message}</div>`;
                    }
                }
            }, 2000); // Poll every 2 seconds

        } catch (error) {
            statusArea.innerHTML = `<div class="error-message">Transpilation failed: ${error.message}</div>`;
            
            if (error.message.includes('Premium')) {
                statusArea.innerHTML += '<div class="warning-message">Note: The Transpiler Service requires an IBM Quantum Premium Plan subscription.</div>';
            }
        } finally {
            transpileBtn.disabled = false;
        }
    });

    estimateBtn.addEventListener('click', async () => {
        const circuit = circuitInput.value.trim();
        const backend = backendSelect.value;
        
        if (!circuit || !backend) {
            statusArea.innerHTML = '<div class="error-message">Please enter a circuit and select a backend</div>';
            return;
        }

        estimateBtn.disabled = true;
        statusArea.innerHTML = '<div class="loading-spinner"></div><p>Estimating circuit cost...</p>';

        try {
            const estimate = await api.estimateCircuitCost(circuit, backend);
            
            resultsArea.innerHTML = `
                <div class="card">
                    <h3>Circuit Cost Estimation</h3>
                    <table>
                        <tr>
                            <td><strong>Backend:</strong></td>
                            <td>${estimate.backend}</td>
                        </tr>
                        <tr>
                            <td><strong>Estimated Time:</strong></td>
                            <td>${estimate.estimatedTime || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Gate Count:</strong></td>
                            <td>${estimate.gateCount || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Circuit Depth:</strong></td>
                            <td>${estimate.depth || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Shots:</strong></td>
                            <td>${estimate.shots}</td>
                        </tr>
                    </table>
                </div>
            `;
            
            statusArea.innerHTML = '<div class="success-message">✅ Cost estimation completed</div>';
        } catch (error) {
            statusArea.innerHTML = `<div class="error-message">Failed to estimate cost: ${error.message}</div>`;
        } finally {
            estimateBtn.disabled = false;
        }
    });

    function displayTranspilationResults(result) {
        const transpiled = result.transpiled_circuit || result.circuit || 'No transpiled circuit available';
        const metrics = result.metrics || {};
        
        resultsArea.innerHTML = `
            <div class="card">
                <h3>Transpilation Results</h3>
                
                ${metrics ? `
                <div style="margin-bottom: 1rem;">
                    <h4>Metrics</h4>
                    <table>
                        ${metrics.gate_count ? `<tr><td><strong>Gate Count:</strong></td><td>${metrics.gate_count}</td></tr>` : ''}
                        ${metrics.depth ? `<tr><td><strong>Depth:</strong></td><td>${metrics.depth}</td></tr>` : ''}
                        ${metrics.transpilation_time ? `<tr><td><strong>Transpilation Time:</strong></td><td>${metrics.transpilation_time}s</td></tr>` : ''}
                        ${metrics.layout ? `<tr><td><strong>Qubit Layout:</strong></td><td>${JSON.stringify(metrics.layout)}</td></tr>` : ''}
                    </table>
                </div>
                ` : ''}
                
                <h4>Transpiled Circuit</h4>
                <div class="code-block" style="max-height: 400px; overflow-y: auto;">
                    <pre>${transpiled}</pre>
                </div>
                
                <div style="margin-top: 1rem;">
                    <button id="copy-circuit" class="secondary">Copy Circuit</button>
                    <button id="download-circuit" class="secondary">Download Circuit</button>
                </div>
            </div>
        `;

        document.getElementById('copy-circuit')?.addEventListener('click', () => {
            navigator.clipboard.writeText(transpiled);
            statusArea.innerHTML = '<div class="success-message">Circuit copied to clipboard!</div>';
        });

        document.getElementById('download-circuit')?.addEventListener('click', () => {
            const blob = new Blob([transpiled], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transpiled_circuit_${Date.now()}.qasm`;
            a.click();
            window.URL.revokeObjectURL(url);
            statusArea.innerHTML = '<div class="success-message">Circuit downloaded!</div>';
        });
    }
}