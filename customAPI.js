export class QuantumAPI {
  constructor() {
    this.baseUrl = "https://api.quantum-computing.ibm.com/runtime";
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  _checkToken() {
    if (!this.token) {
      throw new Error("No token set. Please insert Token first");
    }
  }

  async _fetch(path) {
    this._checkToken();
    const url = `${this.baseUrl}/${path}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
  }

  async getUsage() {
    return this._fetch("usage");
  }

  async getUser() {
    return this._fetch("users/me");
  }

  async getBackends() {
    return this._fetch("backends");
  }

  async getBackendsStatus(backendID) {
    return this._fetch(`backends/${backendID}/status`);
  }

  async getInfo() {
    const [userData, usageData, backendsData] = await Promise.all([
      this.getUser(),
      this.getUsage(),
      this.getBackends(),
    ]);

    const uniqueDevices = Array.from(new Set(backendsData.devices || []));

    const statusPromises = uniqueDevices.map(async (deviceID) => {
      const status = await this.getBackendsStatus(deviceID);
      return {
        deviceID,
        ...status,
      };
    });

    const devicesWithStatus = await Promise.all(statusPromises);

    return {
      UserInfo: userData,
      Usages: usageData,
      Backends: { devices: devicesWithStatus },
    };
  }
}
