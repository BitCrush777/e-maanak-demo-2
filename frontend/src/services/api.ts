import { mockStore, MockInstrument, MockApplication, MockRule, MockCertificate } from './mockData';

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
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Backend server unreachable. Utilizing offline mock database.',
      },
    };
  }
}

export const api = {
  // Auth
  async getProfile() {
    const res = await request<{ user: any }>('/api/v1/auth/me');
    if (res.data) return res;

    // Demo user fallback from localStorage
    const savedUser = localStorage.getItem('emaanak_demo_user');
    if (savedUser) {
      return { data: { user: JSON.parse(savedUser) } };
    }
    return res;
  },

  async logout() {
    localStorage.removeItem('emaanak_demo_user');
    localStorage.removeItem('access_token');
    return request('/api/v1/auth/logout', { method: 'POST' });
  },

  // Instruments
  async getInstruments(params?: { page?: number; pageSize?: number; status?: string; type?: string; search?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const res = await request<{ instruments: any[]; total: number }>(`/api/v1/instruments${queryString ? `?${queryString}` : ''}`);
    if (res.data && res.data.instruments) return res;

    // Fallback to mock store
    let list = mockStore.getInstruments();
    if (params?.status) {
      list = list.filter((i) => i.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((i) =>
        i.serialNumber.toLowerCase().includes(q) ||
        i.manufacturer.toLowerCase().includes(q) ||
        i.model.toLowerCase().includes(q)
      );
    }
    return {
      data: {
        instruments: list,
        total: list.length,
      },
    };
  },

  async getInstrument(id: string) {
    const res = await request<{ instrument: any }>(`/api/v1/instruments/${id}`);
    if (res.data) return res;

    const inst = mockStore.getInstruments().find((i) => i.id === id);
    return { data: { instrument: inst } };
  },

  async createInstrument(data: {
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    ratedCapacity?: string;
    verificationInterval?: number;
  }) {
    const res = await request<{ instrument: any }>('/api/v1/instruments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data) return res;

    // Fallback
    const saved = mockStore.saveInstrument({
      ...data,
      ownerId: 'demo-owner-id',
      verificationInterval: data.verificationInterval || 12,
    });
    return { data: { instrument: saved } };
  },

  async updateInstrument(id: string, data: any) {
    const res = await request<{ instrument: any }>(`/api/v1/instruments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  },

  // Applications
  async getApplications(params?: { page?: number; pageSize?: number; status?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const res = await request<{ applications: any[]; total: number }>(`/api/v1/applications${queryString ? `?${queryString}` : ''}`);
    if (res.data && res.data.applications) return res;

    let apps = mockStore.getApplications();
    if (params?.status) {
      apps = apps.filter((a) => a.status === params.status);
    }
    return {
      data: {
        applications: apps,
        total: apps.length,
      },
    };
  },

  async getApplication(id: string) {
    const res = await request<{ application: any }>(`/api/v1/applications/${id}`);
    if (res.data) return res;

    const app = mockStore.getApplications().find((a) => a.id === id);
    return { data: { application: app } };
  },

  async createApplication(instrumentId: string) {
    const res = await request<{ application: any }>('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify({ instrumentId }),
    });
    if (res.data) return res;

    const app = mockStore.createApplication(instrumentId, 'demo-owner-id');
    return { data: { application: app } };
  },

  // Verifications
  async getRules() {
    const res = await request<{ rules: any[] }>('/api/v1/verifications/rules');
    if (res.data && res.data.rules?.length) return res;

    return { data: { rules: mockStore.getRules() } };
  },

  async getQueue(page?: number, pageSize?: number) {
    const res = await request<{ applications: any[]; total: number }>(`/api/v1/verifications/queue?page=${page || 1}&pageSize=${pageSize || 20}`);
    if (res.data && res.data.applications) return res;

    const queue = mockStore.getApplications().filter((a) =>
      ['SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW'].includes(a.status)
    );
    return {
      data: {
        applications: queue,
        total: queue.length,
      },
    };
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
    const res = await request<any>('/api/v1/verifications/inspect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.data) return res;

    // Authoritative calculation in mock store
    const rule = mockStore.getRules().find((r) => r.id === data.ruleId) || mockStore.getRules()[0];
    const absTol = parseFloat(rule.toleranceConfig.absoluteTolerance || '0.01');

    const processedReadings = data.readings.map((r) => {
      const ref = parseFloat(r.referenceLoad) || 0;
      const obs = parseFloat(r.observedValue) || 0;
      const error = obs - ref;
      const pct = ref !== 0 ? (error / ref) * 100 : 0;
      const isPass = Math.abs(error) <= absTol;
      return {
        pointName: r.pointName,
        referenceLoad: ref.toFixed(4),
        observedValue: obs.toFixed(4),
        error: error.toFixed(4),
        percentageError: pct.toFixed(4),
        result: isPass ? ('PASS' as const) : ('FAIL' as const),
      };
    });

    const result = mockStore.recordInspection({
      applicationId: data.applicationId,
      ruleId: data.ruleId,
      officerName: 'Inspector Rajesh Kumar (Legal Metrology Division)',
      notes: data.notes,
      readings: processedReadings,
    });

    return {
      data: {
        result: result.result,
        certificate: result.certificate,
        message: result.result === 'PASS' ? 'Inspection passed. Certificate generated!' : 'Inspection completed with failure.',
      },
    };
  },

  // Certificates
  async getCertificates(params?: { page?: number; pageSize?: number; status?: string }) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const res = await request<{ certificates: any[]; total: number }>(`/api/v1/certificates${queryString ? `?${queryString}` : ''}`);
    if (res.data && res.data.certificates) return res;

    let list = mockStore.getCertificates();
    if (params?.status) {
      list = list.filter((c) => c.status === params.status);
    }
    return {
      data: {
        certificates: list,
        total: list.length,
      },
    };
  },

  async getCertificate(certificateNumber: string) {
    const res = await request<{ certificate: any }>(`/api/v1/certificates/${certificateNumber}`);
    if (res.data) return res;

    const cert = mockStore.getCertificateByToken(certificateNumber);
    return { data: { certificate: cert } };
  },

  async revokeCertificate(certificateNumber: string, revocationReason: string) {
    const res = await request<{ certificate: any }>(`/api/v1/certificates/${certificateNumber}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ revocationReason }),
    });
    if (res.data) return res;

    const cert = mockStore.revokeCertificate(certificateNumber, revocationReason);
    return { data: { certificate: cert, message: 'Certificate revoked successfully.' } };
  },

  // Public verification
  async verifyCertificate(token: string) {
    const res = await request<any>(`/api/v1/public/verify/${token}`);
    if (res.data) return res;

    const cert = mockStore.getCertificateByToken(token);
    if (!cert) {
      return {
        data: {
          status: 'INVALID',
          message: 'Certificate not found in sovereign verification registry.',
        },
      };
    }

    return {
      data: {
        status: cert.status,
        message: cert.status === 'VALID' ? 'This certificate is authentic and legally valid.' : `Certificate status: ${cert.status}`,
        certificate: {
          certificateNumber: cert.certificateNumber,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          instrument: cert.instrument,
          verificationOfficer: cert.verificationOfficer,
          applicantName: cert.applicantName,
          result: 'PASS',
          readings: cert.readings,
        },
      },
    };
  },
};
