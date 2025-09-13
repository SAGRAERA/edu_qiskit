export class QuantumAPIv3 {
    constructor() {
        // Multiple IBM Quantum service endpoints - Updated to current endpoints
        this.endpoints = {
            runtime: "https://quantum.cloud.ibm.com/api/v1",
            auth: "https://iam.cloud.ibm.com/identity/token",
            authQuantum: "https://auth.quantum-computing.ibm.com/api",
            legacy: "https://quantum.cloud.ibm.com/api"
        };
        
        this.apiKey = null;
        this.bearerToken = null;
        this.instanceCRN = null;
        this.tokenExpiry = null;
        this.isIBMCloudKey = false; // Flag to determine key type
        this.selectedEndpoint = 'runtime'; // Default endpoint
        this.currentUserId = null; // Store current user ID
    }

    setToken(apiKey) {
        this.apiKey = apiKey;
        
        // Check if it's an IBM Cloud API key (starts with specific patterns) or IBM Quantum token
        // IBM Cloud keys often start with patterns, while Quantum tokens are usually random
        if (apiKey.includes('-') && apiKey.length > 40) {
            // Likely IBM Cloud API key
            this.isIBMCloudKey = true;
            return this.getIAMToken();
        } else {
            // Likely IBM Quantum Platform token - use directly
            this.isIBMCloudKey = false;
            this.bearerToken = apiKey;
            this.tokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry
            console.log('Using IBM Quantum Platform token directly');
            return this.validateToken();
        }
    }
    
    async getIAMToken() {
        if (!this.apiKey) {
            throw new Error("No API key set");
        }
        
        try {
            // Properly encode the form data
            const formData = `grant_type=${encodeURIComponent('urn:ibm:params:oauth:grant-type:apikey')}&apikey=${encodeURIComponent(this.apiKey)}`;
            
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            };
            
            console.log('Getting IAM token for API key:', this.apiKey.substring(0, 10) + '...');
            
            // Use Electron's IPC for API requests if available
            if (typeof window !== 'undefined' && window.api && window.api.quantumAPIRequest) {
                const response = await window.api.quantumAPIRequest({
                    url: this.endpoints.auth,
                    method: 'POST',
                    headers,
                    body: formData
                });
                
                console.log('IAM response status:', response.status);
                
                if (response.status === 200 || response.status === 201) {
                    this.bearerToken = response.data.access_token;
                    this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
                    console.log('IAM token obtained successfully, expires at:', this.tokenExpiry);
                    return { valid: true, token: this.bearerToken };
                } else {
                    console.error('Failed to get IAM token:', response.data);
                    throw new Error(`Failed to get IAM token: ${JSON.stringify(response.data)}`);
                }
            } else {
                // Fallback for non-Electron
                const response = await fetch(this.endpoints.auth, {
                    method: 'POST',
                    headers,
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.bearerToken = data.access_token;
                    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
                    return { valid: true, token: this.bearerToken };
                } else {
                    const errorData = await response.text();
                    throw new Error(`Failed to get IAM token: ${errorData}`);
                }
            }
        } catch (error) {
            console.error('IAM token error:', error.message);
            return { valid: false, error: error.message };
        }
    }

    async validateToken() {
        try {
            await this.ensureValidToken();
            
            // Try to get backends to validate token
            const response = await this._fetch('/backends', 'runtime');
            return { valid: true, backends: response };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
    
    async ensureValidToken() {
        if (!this.bearerToken || !this.tokenExpiry || new Date() > this.tokenExpiry) {
            if (this.isIBMCloudKey) {
                const result = await this.getIAMToken();
                if (!result.valid) {
                    throw new Error('Failed to refresh token');
                }
            } else {
                // For IBM Quantum tokens, we can't refresh automatically
                throw new Error('Token has expired. Please provide a new token.');
            }
        }
    }

    _checkToken() {
        if (!this.bearerToken) {
            throw new Error("No bearer token. Please authenticate first");
        }
        
        if (this.tokenExpiry && new Date() > this.tokenExpiry) {
            throw new Error("Token has expired. Please refresh or set a new token");
        }
    }

    async _fetch(path, service = 'runtime', options = {}) {
        await this.ensureValidToken();
        
        const baseUrl = this.endpoints[service] || this.endpoints.runtime;
        const url = `${baseUrl}${path}`;
        
        const headers = {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ...(this.instanceCRN && { 'Service-CRN': this.instanceCRN }),
            ...options.headers
        };
        
        try {
            // Use Electron's IPC for API requests if available
            if (typeof window !== 'undefined' && window.api && window.api.quantumAPIRequest) {
                const response = await window.api.quantumAPIRequest({
                    url,
                    method: options.method || 'GET',
                    headers,
                    body: options.body
                });
                
                if (response.status === 0) {
                    throw new Error(response.data?.error || 'Network error: Please check your internet connection');
                }
                
                if (response.status === 401) {
                    console.error('401 Unauthorized - Token may be invalid or expired');
                    throw new Error('Unauthorized: Invalid or expired token');
                }
                
                if (response.status === 403) {
                    console.error('403 Forbidden - Check if Service-CRN is needed:', response.data);
                    throw new Error(`Forbidden: ${response.data?.message || response.data?.error || 'Access denied. Check if Service-CRN header is needed.'}`);
                }
                
                if (response.status >= 400) {
                    console.error(`API Error ${response.status}:`, response.data);
                    const errorData = response.data || {};
                    throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
                }
                
                return response.data || {};
            } else {
                // Fallback to regular fetch for non-Electron environments
                const response = await fetch(url, {
                    method: options.method || 'GET',
                    headers,
                    body: options.body ? JSON.stringify(options.body) : undefined
                });
                
                if (response.status === 401) {
                    throw new Error('Unauthorized: Invalid or expired token');
                }
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
                }
                
                // Handle empty responses
                const text = await response.text();
                return text ? JSON.parse(text) : {};
            }
        } catch (error) {
            if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error('Network error: Please check your internet connection');
            }
            throw error;
        }
    }

    // ============= User & Authentication =============
    async getInstances() {
        // IBM Quantum doesn't have an instances endpoint
        // Return a default instance structure
        return { 
            instances: [
                'ibm-q/open/main' // Default open instance
            ] 
        };
    }
    
    setInstanceCRN(crn) {
        this.instanceCRN = crn;
    }

    async refreshAccessToken() {
        return this.getIAMToken();
    }

    // ============= Transpiler Service =============
    async transpile(circuits, backend, options = {}) {
        const transpileOptions = {
            backend,
            optimization_level: options.optimizationLevel || 1,
            ai: options.useAI || false,
            circuits: Array.isArray(circuits) ? circuits : [circuits],
            ...options
        };
        
        const response = await this._fetch('/transpile', 'transpiler', {
            method: 'POST',
            body: transpileOptions
        });
        
        return response.task_id || response;
    }

    async getTranspilationResult(taskId) {
        return this._fetch(`/transpile/${taskId}`, 'transpiler');
    }

    async getTranspilerBackends() {
        const [routing, permutations, linearFunctions] = await Promise.all([
            this._fetch('/routing/backends', 'transpiler'),
            this._fetch('/permutations/backends', 'transpiler'),
            this._fetch('/linear_functions/backends', 'transpiler')
        ]);
        
        return {
            routing,
            permutations,
            linearFunctions
        };
    }

    // ============= Runtime Service =============
    async getNetworks() {
        return this._fetch('/Network', 'runtime');
    }

    async getBackends() {
        return this._fetch('/backends', 'runtime');
    }

    async getBackendDetails(backendName) {
        return this._fetch(`/backends/${backendName}`, 'runtime');
    }

    async getBackendStatus(backendName) {
        return this._fetch(`/backends/${backendName}/status`, 'runtime');
    }

    async getBackendProperties(backendName) {
        return this._fetch(`/backends/${backendName}/properties`, 'runtime');
    }

    async getBackendConfiguration(backendName) {
        return this._fetch(`/backends/${backendName}/configuration`, 'runtime');
    }

    async getBackendDefaults(backendName) {
        return this._fetch(`/backends/${backendName}/defaults`, 'runtime');
    }

    // ============= Jobs Management =============
    async getJobs(limit = 10, offset = 0, filters = {}) {
        let path = `/jobs?limit=${limit}&offset=${offset}`;
        
        if (filters.status) path += `&status=${filters.status}`;
        if (filters.backend) path += `&backend=${filters.backend}`;
        if (filters.created_after) path += `&created_after=${filters.created_after}`;
        if (filters.created_before) path += `&created_before=${filters.created_before}`;
        
        const response = await this._fetch(path, 'runtime');
        
        // Log jobs to understand what we're getting
        if (response.jobs && Array.isArray(response.jobs)) {
            console.log(`Retrieved ${response.jobs.length} total jobs`);
            
            // Check if we can identify user's jobs
            // Some jobs might have tags or other identifiers
            if (response.jobs.length > 0) {
                const sampleJob = response.jobs[0];
                console.log('Sample job for filtering analysis:', {
                    id: sampleJob.id,
                    status: sampleJob.status,
                    backend: sampleJob.backend,
                    created: sampleJob.created,
                    tags: sampleJob.tags,
                    user_hub: sampleJob.user_hub,
                    hub: sampleJob.hub,
                    group: sampleJob.group,
                    project: sampleJob.project
                });
            }
        }
        
        return response;
    }

    async getJobDetails(jobId) {
        return this._fetch(`/jobs/${jobId}`, 'runtime');
    }

    async getJobResults(jobId) {
        return this._fetch(`/jobs/${jobId}/results`, 'runtime');
    }

    async getJobStatus(jobId) {
        return this._fetch(`/jobs/${jobId}/status`, 'runtime');
    }

    async getJobLogs(jobId) {
        return this._fetch(`/jobs/${jobId}/logs`, 'runtime');
    }

    async cancelJob(jobId) {
        return this._fetch(`/jobs/${jobId}/cancel`, 'runtime', { method: 'POST' });
    }

    async deleteJob(jobId) {
        return this._fetch(`/jobs/${jobId}`, 'runtime', { method: 'DELETE' });
    }

    async submitJob(program, options = {}) {
        const jobData = {
            program_id: program.programId || 'sampler',
            backend: options.backend,
            params: {
                circuits: program.circuits,
                observables: program.observables,
                parameter_values: program.parameterValues,
                shots: options.shots || 4096,
                ...options.params
            },
            runtime_options: {
                execution: {
                    shots: options.shots || 4096,
                    init_qubits: options.initQubits || true
                },
                ...options.runtimeOptions
            }
        };
        
        return this._fetch('/jobs', 'runtime', {
            method: 'POST',
            body: jobData
        });
    }

    // ============= Programs =============
    async getPrograms(limit = 50) {
        return this._fetch(`/programs?limit=${limit}`, 'runtime');
    }

    async getProgramDetails(programId) {
        return this._fetch(`/programs/${programId}`, 'runtime');
    }

    async uploadProgram(programData) {
        return this._fetch('/programs', 'runtime', {
            method: 'POST',
            body: programData
        });
    }

    async updateProgram(programId, updates) {
        return this._fetch(`/programs/${programId}`, 'runtime', {
            method: 'PUT',
            body: updates
        });
    }

    async deleteProgram(programId) {
        return this._fetch(`/programs/${programId}`, 'runtime', {
            method: 'DELETE'
        });
    }

    // ============= Usage & Quotas =============
    async getUsage(startDate = null, endDate = null) {
        let path = '/usage';
        const params = [];
        
        if (startDate) params.push(`start_date=${startDate}`);
        if (endDate) params.push(`end_date=${endDate}`);
        
        if (params.length > 0) {
            path += '?' + params.join('&');
        }
        
        return this._fetch(path, 'runtime');
    }

    async getQuota() {
        return this._fetch('/quota', 'runtime');
    }

    // ============= Sessions =============
    async createSession(backend, options = {}) {
        const sessionData = {
            backend,
            instance: options.instance,
            max_time: options.maxTime || 28800, // 8 hours default
            ...options
        };
        
        return this._fetch('/sessions', 'runtime', {
            method: 'POST',
            body: sessionData
        });
    }

    async getSession(sessionId) {
        return this._fetch(`/sessions/${sessionId}`, 'runtime');
    }

    async getSessions(limit = 10) {
        return this._fetch(`/sessions?limit=${limit}`, 'runtime');
    }

    async closeSession(sessionId) {
        return this._fetch(`/sessions/${sessionId}/close`, 'runtime', {
            method: 'POST'
        });
    }

    // ============= Comprehensive Info =============
    async getInfo() {
        try {
            await this.ensureValidToken();
            
            if (!this.instanceCRN) {
                console.warn('No CRN set. Some API calls may fail.');
            }
            
            // Note: /users/me endpoint is not available in current API
            
            const [backends, jobs] = await Promise.all([
                this.getBackends().catch((error) => {
                    console.error('Failed to get backends:', error);
                    return { backends: [] };
                }),
                this.getJobs(50).catch((error) => {  // Get more jobs
                    console.error('Failed to get jobs:', error);
                    return { jobs: [] };
                })
            ]);
            
            console.log('Backends response:', backends);
            console.log('Jobs response:', jobs);
            
            // Log job details to understand structure
            if (jobs.jobs && jobs.jobs.length > 0) {
                console.log('First job details:', jobs.jobs[0]);
                console.log('Job fields available:', Object.keys(jobs.jobs[0]));
            }
            
            // Get the instances
            const instances = [this.instanceCRN];

            // Handle different backend response formats
            let backendList = [];
            if (Array.isArray(backends)) {
                backendList = backends;
            } else if (backends.devices && Array.isArray(backends.devices)) {
                backendList = backends.devices;
            } else if (backends.backends && Array.isArray(backends.backends)) {
                backendList = backends.backends;
            }
            
            let jobsList = jobs.jobs || [];
            
            // Sort jobs by creation date (most recent first)
            if (jobsList.length > 0) {
                jobsList = jobsList.sort((a, b) => {
                    const dateA = new Date(a.created || a.creation_date || 0);
                    const dateB = new Date(b.created || b.creation_date || 0);
                    return dateB - dateA;
                });
            }
            
            // Process backend information and get details
            const backendInfo = await Promise.all(backendList.map(async (backend) => {
                let backendName = '';
                
                // If backend is just a string (backend name)
                if (typeof backend === 'string') {
                    backendName = backend;
                } else {
                    backendName = backend.backend_name || backend.name || backend;
                }
                
                // Try to get backend details
                let details = null;
                try {
                    const [status, config] = await Promise.all([
                        this.getBackendStatus(backendName).catch(() => null),
                        this.getBackendConfiguration(backendName).catch(() => null)
                    ]);
                    details = { status, config };
                } catch (e) {
                    console.log(`Could not get details for ${backendName}`);
                }
                
                // Build backend info object
                if (typeof backend === 'string') {
                    // Calculate estimated queue time
                    const pendingJobs = details?.status?.pending_jobs || 0;
                    const estimatedTime = pendingJobs > 0 ? 
                        (pendingJobs < 5 ? '< 5 min' : 
                         pendingJobs < 20 ? '5-30 min' : 
                         pendingJobs < 50 ? '30-60 min' : '> 1 hour') : 
                        'Available now';
                    
                    return {
                        name: backendName,
                        status: details?.status?.state || 'available',
                        operational: details?.status?.operational !== false,
                        pending_jobs: details?.status?.pending_jobs || 0,
                        estimated_queue_time: estimatedTime,
                        backend_version: details?.config?.backend_version || 'N/A',
                        n_qubits: details?.config?.n_qubits || 'N/A',
                        simulator: backendName.includes('simulator') || backendName.includes('sim'),
                        processor_type: details?.config?.processor_type?.family || 'Quantum'
                    };
                }
                
                // If backend is an object with details
                const pendingJobsCount = details?.status?.pending_jobs || backend.pending_jobs || 0;
                const queueTime = pendingJobsCount > 0 ? 
                    (pendingJobsCount < 5 ? '< 5 min' : 
                     pendingJobsCount < 20 ? '5-30 min' : 
                     pendingJobsCount < 50 ? '30-60 min' : '> 1 hour') : 
                    'Available now';
                
                return {
                    name: backendName,
                    status: details?.status?.state || backend.state?.state || 'available', 
                    operational: details?.status?.operational ?? backend.state?.operational !== false,
                    pending_jobs: pendingJobsCount,
                    estimated_queue_time: queueTime,
                    backend_version: details?.config?.backend_version || backend.backend_version || 'N/A',
                    n_qubits: details?.config?.n_qubits || backend.configuration?.n_qubits || backend.n_qubits || 'N/A',
                    simulator: backend.simulator || false,
                    processor_type: details?.config?.processor_type?.family || backend.configuration?.processor_type || 'Quantum'
                };
            }));

            return {
                UserInfo: {
                    instances: instances,
                    currentCRN: this.instanceCRN
                },
                Jobs: {
                    recent: jobsList.slice(0, 5).map(job => ({
                        id: job.id,
                        status: job.status,
                        backend: job.backend,
                        created: job.created
                    })),
                    total: jobs.count || jobsList.length
                },
                Backends: backendInfo,
                Features: {
                    hasAccess: true,
                    tokenValid: true
                }
            };
        } catch (error) {
            throw new Error(`Failed to get complete info: ${error.message}`);
        }
    }

    async testConnection() {
        try {
            await this.ensureValidToken();
            
            // Try to get backends to test connection
            const backends = await this._fetch('/backends', 'runtime');
            return { 
                success: true, 
                message: 'Connection successful',
                backends: backends?.backends?.length || 0
            };
        } catch (error) {
            return { 
                success: false, 
                message: error.message 
            };
        }
    }

    // ============= Circuit Utilities =============
    async optimizeCircuit(circuit, backend, optimizationLevel = 2) {
        return this.transpile(circuit, backend, {
            optimizationLevel,
            useAI: true
        });
    }

    async estimateCircuitCost(circuit, backend, shots = 4096) {
        const transpileResult = await this.transpile(circuit, backend);
        const transpilationData = await this.getTranspilationResult(transpileResult);
        
        return {
            estimatedTime: transpilationData.estimated_time,
            gateCount: transpilationData.gate_count,
            depth: transpilationData.depth,
            shots: shots,
            backend: backend
        };
    }
}