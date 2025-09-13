export class QuantumAPIv2 {
    constructor() {
        this.baseUrl = "https://api.quantum.ibm.com";
        this.token = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
    }

    setToken(token) {
        this.token = token;
        this.validateToken();
    }

    async validateToken() {
        try {
            const response = await this._fetch('/users/me');
            this.tokenExpiry = new Date(Date.now() + 3600000);
            return { valid: true, user: response };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    _checkToken() {
        if (!this.token) {
            throw new Error("No token set. Please insert Token first");
        }
        
        if (this.tokenExpiry && new Date() > this.tokenExpiry) {
            throw new Error("Token has expired. Please refresh or set a new token");
        }
    }

    async _fetch(path, options = {}) {
        this._checkToken();
        
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };
        
        try {
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
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            if (error.message.includes('network')) {
                throw new Error('Network error: Please check your internet connection');
            }
            throw error;
        }
    }

    async getUser() {
        return this._fetch('/users/me');
    }

    async getNetworks() {
        return this._fetch('/network');
    }

    async getInstances() {
        const networks = await this.getNetworks();
        return networks.instances || [];
    }

    async getBackends(instanceId = null) {
        const path = instanceId 
            ? `/network/${instanceId}/devices`
            : '/devices';
        return this._fetch(path);
    }

    async getBackendDetails(backendName) {
        return this._fetch(`/devices/${backendName}`);
    }

    async getBackendStatus(backendName) {
        return this._fetch(`/devices/${backendName}/status`);
    }

    async getBackendProperties(backendName) {
        return this._fetch(`/devices/${backendName}/properties`);
    }

    async getJobs(limit = 10, offset = 0, status = null) {
        let path = `/jobs?limit=${limit}&offset=${offset}`;
        if (status) {
            path += `&status=${status}`;
        }
        return this._fetch(path);
    }

    async getJobDetails(jobId) {
        return this._fetch(`/jobs/${jobId}`);
    }

    async getJobResults(jobId) {
        return this._fetch(`/jobs/${jobId}/results`);
    }

    async cancelJob(jobId) {
        return this._fetch(`/jobs/${jobId}/cancel`, { method: 'POST' });
    }

    async submitJob(backendName, circuits, options = {}) {
        const jobData = {
            backend: backendName,
            program_data: circuits,
            shots: options.shots || 1024,
            memory: options.memory || false,
            ...options
        };
        
        return this._fetch('/jobs', {
            method: 'POST',
            body: jobData
        });
    }

    async getUsage(startDate = null, endDate = null) {
        let path = '/usage';
        const params = [];
        
        if (startDate) {
            params.push(`start_date=${startDate}`);
        }
        if (endDate) {
            params.push(`end_date=${endDate}`);
        }
        
        if (params.length > 0) {
            path += '?' + params.join('&');
        }
        
        return this._fetch(path);
    }

    async getPrograms() {
        return this._fetch('/programs');
    }

    async getProgramDetails(programId) {
        return this._fetch(`/programs/${programId}`);
    }

    async getInfo() {
        try {
            const [userData, instances, usage] = await Promise.all([
                this.getUser(),
                this.getInstances(),
                this.getUsage()
            ]);

            let backends = [];
            if (instances.length > 0) {
                const defaultInstance = instances.find(i => i.is_default) || instances[0];
                const backendData = await this.getBackends(defaultInstance.id);
                
                const backendPromises = backendData.devices.map(async (device) => {
                    try {
                        const status = await this.getBackendStatus(device.name);
                        return {
                            name: device.name,
                            status: status.state,
                            operational: status.operational,
                            pending_jobs: status.pending_jobs,
                            backend_version: device.version,
                            basis_gates: device.basis_gates,
                            n_qubits: device.n_qubits,
                            simulator: device.simulator
                        };
                    } catch (error) {
                        return {
                            name: device.name,
                            status: 'unknown',
                            error: error.message
                        };
                    }
                });
                
                backends = await Promise.all(backendPromises);
            }

            return {
                UserInfo: {
                    id: userData.id,
                    email: userData.email,
                    username: userData.username,
                    instances: instances.map(i => ({
                        id: i.id,
                        name: i.name,
                        provider: i.provider,
                        is_default: i.is_default
                    }))
                },
                Usage: {
                    monthly_quota: usage.monthly_quota_seconds,
                    monthly_usage: usage.monthly_usage_seconds,
                    remaining: usage.monthly_quota_seconds - usage.monthly_usage_seconds,
                    jobs_count: usage.jobs_count
                },
                Backends: backends
            };
        } catch (error) {
            throw new Error(`Failed to get complete info: ${error.message}`);
        }
    }

    async testConnection() {
        try {
            await this.getUser();
            return { success: true, message: 'Connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}