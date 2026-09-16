const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred.',
        },
      };
    }

    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to the server.',
      },
    };
  }
}

export const api = {
  // Auth
  async getProfile() {
    return request<{ user: any }>('/api/v1/auth/me');
  },

  async logout() {
    return request('/api/v1/auth/logout', { method: 'POST' });
  },

  // Instruments
  async getInstruments(params?: { page?: number; pageSize?: number; status?: string; type?: string; search?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return request<{ instruments: any[]; total: number }>(`/api/v1/instruments${queryString ? `?${queryString}` : ''}`);
  },

  async getInstrument(id: string) {
    return request<{ instrument: any }>(`/api/v1/instruments/${id}`);
  },

  async createInstrument(data: {
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    ratedCapacity?: string;
    verificationInterval?: number;
  }) {
    return request<{ instrument: any }>('/api/v1/instruments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateInstrument(id: string, data: any) {
    return request<{ instrument: any }>(`/api/v1/instruments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Applications
  async getApplications(params?: { page?: number; pageSize?: number; status?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return request<{ applications: any[]; total: number }>(`/api/v1/applications${queryString ? `?${queryString}` : ''}`);
  },

  async getApplication(id: string) {
    return request<{ application: any }>(`/api/v1/applications/${id}`);
  },

  async createApplication(instrumentId: string) {
    return request<{ application: any }>('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify({ instrumentId }),
    });
  },

  // Verifications
  async getRules() {
    return request<{ rules: any[] }>('/api/v1/verifications/rules');
  },

  async getQueue(page?: number, pageSize?: number) {
    return request<{ applications: any[]; total: number }>(`/api/v1/verifications/queue?page=${page || 1}&pageSize=${pageSize || 20}`);
  },

  async performInspection(data: {
    applicationId: string;
    ruleId: string;
    clientOperationId?: string;
    notes?: string;
    readings: Array<{
      pointName: string;
      referenceLoad: string;
      observedValue: string;
    }>;
  }) {
    return request<any>('/api/v1/verifications/inspect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Certificates
  async getCertificates(params?: { page?: number; pageSize?: number; status?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return request<{ certificates: any[]; total: number }>(`/api/v1/certificates${queryString ? `?${queryString}` : ''}`);
  },

  async getCertificate(certificateNumber: string) {
    return request<{ certificate: any }>(`/api/v1/certificates/${certificateNumber}`);
  },

  async revokeCertificate(certificateNumber: string, revocationReason: string) {
    return request<{ certificate: any }>(`/api/v1/certificates/${certificateNumber}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ revocationReason }),
    });
  },

  // Public verification
  async verifyCertificate(token: string) {
    return request<any>(`/api/v1/public/verify/${token}`);
  },
};
