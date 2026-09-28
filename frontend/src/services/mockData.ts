// Mock & Demo Data Store for e-MAANAK
// Provides an authoritative offline simulation with persistent LocalStorage

export interface MockInstrument {
  id: string;
  ownerId: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  ratedCapacity?: string;
  verificationInterval: number;
  status: 'REGISTERED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'FAILED' | 'RETIRED';
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface MockApplication {
  id: string;
  instrumentId: string;
  applicantId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'INSPECTION_IN_PROGRESS' | 'INSPECTION_COMPLETED' | 'CERTIFICATE_ISSUED' | 'REJECTED';
  assignedOfficerId?: string;
  createdAt: string;
  updatedAt: string;
  instrument: {
    id: string;
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    status?: string;
  };
  applicant: {
    id: string;
    fullName: string;
    email: string;
  };
  assignedOfficer?: {
    id: string;
    fullName: string;
    email: string;
  };
  inspection?: {
    id: string;
    result: string;
    performedAt: string;
  };
}

export interface MockRule {
  id: string;
  instrumentType: string;
  ruleCode: string;
  ruleVersion: string;
  description: string;
  isActive: boolean;
  toleranceConfig: {
    absoluteTolerance: string;
    percentageTolerance: string;
  };
  testPointSchedule: number[];
}

export interface MockReading {
  pointName: string;
  referenceLoad: string;
  observedValue: string;
  error: string;
  percentageError: string;
  result: 'PASS' | 'FAIL';
}

export interface MockCertificate {
  id: string;
  certificateNumber: string;
  verificationInspectionId: string;
  qrToken: string;
  issueDate: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'INVALID';
  revokedAt?: string;
  revocationReason?: string;
  instrument: {
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    ratedCapacity?: string;
  };
  verificationOfficer: string;
  applicantName: string;
  readings: MockReading[];
}

const STORAGE_KEYS = {
  INSTRUMENTS: 'emaanak_demo_instruments',
  APPLICATIONS: 'emaanak_demo_applications',
  CERTIFICATES: 'emaanak_demo_certificates',
  RULES: 'emaanak_demo_rules',
};

export const INITIAL_RULES: MockRule[] = [
  {
    id: 'rule-scale-01',
    instrumentType: 'WEIGHING_SCALE',
    ruleCode: 'WEIGHING_SCALE_V1',
    ruleVersion: '1.0',
    description: 'Standard Verification Procedure for Non-Automatic Weighing Instruments (SIH 2026)',
    isActive: true,
    toleranceConfig: {
      absoluteTolerance: '0.01',
      percentageTolerance: '1.0',
    },
    testPointSchedule: [20, 50, 100],
  },
  {
    id: 'rule-gauge-01',
    instrumentType: 'PRESSURE_GAUGE',
    ruleCode: 'PRESSURE_GAUGE_V1',
    ruleVersion: '1.0',
    description: 'Verification Specification for Industrial Bourdon Tube Pressure Gauges',
    isActive: true,
    toleranceConfig: {
      absoluteTolerance: '0.5',
      percentageTolerance: '2.0',
    },
    testPointSchedule: [25, 50, 75, 100],
  },
  {
    id: 'rule-volumetric-01',
    instrumentType: 'VOLUMETRIC_MEASURE',
    ruleCode: 'VOLUMETRIC_MEASURE_V1',
    ruleVersion: '1.0',
    description: 'Statutory Verification for Commercial Flow & Fuel Dispensing Measures',
    isActive: true,
    toleranceConfig: {
      absoluteTolerance: '0.005',
      percentageTolerance: '0.5',
    },
    testPointSchedule: [50, 100],
  },
];

const INITIAL_INSTRUMENTS: MockInstrument[] = [
  {
    id: 'inst-001',
    ownerId: 'demo-owner-id',
    type: 'WEIGHING_SCALE',
    manufacturer: 'Mettler Toledo Inc.',
    model: 'IND570 Industrial Scale',
    serialNumber: 'MT-IND-2024-9981',
    ratedCapacity: '150 kg',
    verificationInterval: 12,
    status: 'VERIFIED',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'demo-owner-id',
      fullName: 'Sovereign Agro Logistics Ltd.',
      email: 'owner@emaanak.demo',
    },
  },
  {
    id: 'inst-002',
    ownerId: 'demo-owner-id',
    type: 'WEIGHING_SCALE',
    manufacturer: 'Sartorius AG',
    model: 'Quintix 513-1S Precision',
    serialNumber: 'SAR-QX-88210',
    ratedCapacity: '20 kg',
    verificationInterval: 12,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'demo-owner-id',
      fullName: 'Sovereign Agro Logistics Ltd.',
      email: 'owner@emaanak.demo',
    },
  },
  {
    id: 'inst-003',
    ownerId: 'demo-owner-id',
    type: 'PRESSURE_GAUGE',
    manufacturer: 'WIKA Alexander Wiegand',
    model: 'Model 232.50 SS Gauge',
    serialNumber: 'WK-PG-55412',
    ratedCapacity: '10 Bar',
    verificationInterval: 12,
    status: 'REGISTERED',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    owner: {
      id: 'demo-owner-id',
      fullName: 'Sovereign Agro Logistics Ltd.',
      email: 'owner@emaanak.demo',
    },
  },
];

const INITIAL_APPLICATIONS: MockApplication[] = [
  {
    id: 'app-002',
    instrumentId: 'inst-002',
    applicantId: 'demo-owner-id',
    status: 'SUBMITTED',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    instrument: {
      id: 'inst-002',
      type: 'WEIGHING_SCALE',
      manufacturer: 'Sartorius AG',
      model: 'Quintix 513-1S Precision',
      serialNumber: 'SAR-QX-88210',
      status: 'PENDING_VERIFICATION',
    },
    applicant: {
      id: 'demo-owner-id',
      fullName: 'Sovereign Agro Logistics Ltd.',
      email: 'owner@emaanak.demo',
    },
  },
  {
    id: 'app-001',
    instrumentId: 'inst-001',
    applicantId: 'demo-owner-id',
    status: 'CERTIFICATE_ISSUED',
    assignedOfficerId: 'demo-officer-id',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    instrument: {
      id: 'inst-001',
      type: 'WEIGHING_SCALE',
      manufacturer: 'Mettler Toledo Inc.',
      model: 'IND570 Industrial Scale',
      serialNumber: 'MT-IND-2024-9981',
      status: 'VERIFIED',
    },
    applicant: {
      id: 'demo-owner-id',
      fullName: 'Sovereign Agro Logistics Ltd.',
      email: 'owner@emaanak.demo',
    },
    assignedOfficer: {
      id: 'demo-officer-id',
      fullName: 'Inspector Rajesh Kumar',
      email: 'officer@emaanak.demo',
    },
    inspection: {
      id: 'insp-001',
      result: 'PASS',
      performedAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    },
  },
];

const INITIAL_CERTIFICATES: MockCertificate[] = [
  {
    id: 'cert-001',
    certificateNumber: 'CERT-2026-INSP-9981',
    verificationInspectionId: 'insp-001',
    qrToken: 'demo-qr-token-1',
    issueDate: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 337 * 24 * 3600 * 1000).toISOString(),
    status: 'VALID',
    instrument: {
      type: 'WEIGHING_SCALE',
      manufacturer: 'Mettler Toledo Inc.',
      model: 'IND570 Industrial Scale',
      serialNumber: 'MT-IND-2024-9981',
      ratedCapacity: '150 kg',
    },
    verificationOfficer: 'Inspector Rajesh Kumar (LM-Zone-04)',
    applicantName: 'Sovereign Agro Logistics Ltd.',
    readings: [
      {
        pointName: 'Point 1 (20% Capacity)',
        referenceLoad: '30.0000',
        observedValue: '30.0040',
        error: '0.0040',
        percentageError: '0.0133',
        result: 'PASS',
      },
      {
        pointName: 'Point 2 (50% Capacity)',
        referenceLoad: '75.0000',
        observedValue: '75.0060',
        error: '0.0060',
        percentageError: '0.0080',
        result: 'PASS',
      },
      {
        pointName: 'Point 3 (100% Capacity)',
        referenceLoad: '150.0000',
        observedValue: '150.0090',
        error: '0.0090',
        percentageError: '0.0060',
        result: 'PASS',
      },
    ],
  },
];

export const mockStore = {
  getInstruments(): MockInstrument[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTRUMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INSTRUMENTS, JSON.stringify(INITIAL_INSTRUMENTS));
      return INITIAL_INSTRUMENTS;
    }
    return JSON.parse(raw);
  },

  saveInstrument(instrument: Omit<MockInstrument, 'id' | 'createdAt' | 'updatedAt' | 'status'>): MockInstrument {
    const instruments = this.getInstruments();
    const newInst: MockInstrument = {
      ...instrument,
      id: `inst-${Date.now()}`,
      status: 'REGISTERED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: {
        id: instrument.ownerId,
        fullName: 'Sovereign Agro Logistics Ltd.',
        email: 'owner@emaanak.demo',
      },
    };
    instruments.unshift(newInst);
    localStorage.setItem(STORAGE_KEYS.INSTRUMENTS, JSON.stringify(instruments));
    return newInst;
  },

  getApplications(): MockApplication[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  },

  createApplication(instrumentId: string, applicantId: string): MockApplication {
    const instruments = this.getInstruments();
    const inst = instruments.find((i) => i.id === instrumentId);
    if (!inst) throw new Error('Instrument not found');

    inst.status = 'PENDING_VERIFICATION';
    localStorage.setItem(STORAGE_KEYS.INSTRUMENTS, JSON.stringify(instruments));

    const apps = this.getApplications();
    const newApp: MockApplication = {
      id: `app-${Date.now()}`,
      instrumentId,
      applicantId,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      instrument: {
        id: inst.id,
        type: inst.type,
        manufacturer: inst.manufacturer,
        model: inst.model,
        serialNumber: inst.serialNumber,
        status: 'PENDING_VERIFICATION',
      },
      applicant: {
        id: applicantId,
        fullName: 'Sovereign Agro Logistics Ltd.',
        email: 'owner@emaanak.demo',
      },
    };
    apps.unshift(newApp);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    return newApp;
  },

  getCertificates(): MockCertificate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
      return INITIAL_CERTIFICATES;
    }
    return JSON.parse(raw);
  },

  getCertificateByToken(token: string): MockCertificate | undefined {
    return this.getCertificates().find((c) => c.qrToken === token || c.certificateNumber === token);
  },

  getRules(): MockRule[] {
    return INITIAL_RULES;
  },

  recordInspection(data: {
    applicationId: string;
    ruleId: string;
    officerName: string;
    notes?: string;
    readings: MockReading[];
  }): { certificate?: MockCertificate; result: 'PASS' | 'FAIL' } {
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === data.applicationId);
    if (!app) throw new Error('Application not found');

    const instruments = this.getInstruments();
    const inst = instruments.find((i) => i.id === app.instrumentId);

    const hasFailure = data.readings.some((r) => r.result === 'FAIL');
    const result: 'PASS' | 'FAIL' = hasFailure ? 'FAIL' : 'PASS';

    app.status = result === 'PASS' ? 'CERTIFICATE_ISSUED' : 'REJECTED';
    app.updatedAt = new Date().toISOString();
    app.inspection = {
      id: `insp-${Date.now()}`,
      result,
      performedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    if (inst) {
      inst.status = result === 'PASS' ? 'VERIFIED' : 'FAILED';
      inst.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.INSTRUMENTS, JSON.stringify(instruments));
    }

    let cert: MockCertificate | undefined;
    if (result === 'PASS' && inst) {
      const certificates = this.getCertificates();
      const certNumber = `CERT-${new Date().getFullYear()}-INSP-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrToken = `qr-tok-${Date.now().toString(36)}`;
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (inst.verificationInterval || 12));

      cert = {
        id: `cert-${Date.now()}`,
        certificateNumber: certNumber,
        verificationInspectionId: app.inspection.id,
        qrToken,
        issueDate: new Date().toISOString(),
        expiryDate: expiry.toISOString(),
        status: 'VALID',
        instrument: {
          type: inst.type,
          manufacturer: inst.manufacturer,
          model: inst.model,
          serialNumber: inst.serialNumber,
          ratedCapacity: inst.ratedCapacity,
        },
        verificationOfficer: data.officerName,
        applicantName: app.applicant.fullName,
        readings: data.readings,
      };

      certificates.unshift(cert);
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
    }

    return { certificate: cert, result };
  },

  revokeCertificate(certificateNumber: string, reason: string): MockCertificate {
    const certificates = this.getCertificates();
    const cert = certificates.find((c) => c.certificateNumber === certificateNumber);
    if (!cert) throw new Error('Certificate not found');

    cert.status = 'REVOKED';
    cert.revokedAt = new Date().toISOString();
    cert.revocationReason = reason;

    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
    return cert;
  },

  resetDemo() {
    localStorage.removeItem(STORAGE_KEYS.INSTRUMENTS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    localStorage.removeItem(STORAGE_KEYS.RULES);
  },
};
