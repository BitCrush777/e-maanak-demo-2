import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { mockStore } from '../services/mockData';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Alert } from '../components/common/Alert';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { CertificateDocument, CertificateData } from '../components/certificate/CertificateDocument';

export const AdminDashboard: React.FC = () => {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Admin Workspace Tab
  const [adminTab, setAdminTab] = useState<'overview' | 'certificates' | 'instruments' | 'rules' | 'audit'>('overview');

  // Revocation state & modal
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeCertNum, setRevokeCertNum] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Certificate Preview Modal
  const [previewCert, setPreviewCert] = useState<CertificateData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instRes, appRes, certRes, rulesRes] = await Promise.all([
        api.getInstruments(),
        api.getApplications(),
        api.getCertificates(),
        api.getRules(),
      ]);
      if (instRes.data) setInstruments(instRes.data.instruments);
      if (appRes.data) setApplications(appRes.data.applications);
      if (certRes.data) setCertificates(certRes.data.certificates);
      if (rulesRes.data) setRules(rulesRes.data.rules);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRevokeModal = (certNumber: string) => {
    setRevokeCertNum(certNumber);
    setRevokeReason('');
    setIsRevokeModalOpen(true);
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertNum || !revokeReason.trim()) return;

    setRevoking(true);
    try {
      const res = await api.revokeCertificate(revokeCertNum, revokeReason);
      if (res.data) {
        setNotice({
          type: 'success',
          message: `Certificate ${revokeCertNum} revoked successfully. Registry updated.`,
        });
        setIsRevokeModalOpen(false);
        setRevokeCertNum('');
        setRevokeReason('');
        await loadData();
      }
    } catch (e: any) {
      setNotice({
        type: 'error',
        message: e.message || 'Failed to revoke certificate.',
      });
    } finally {
      setRevoking(false);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data (instruments, inspections, certificates) to clean default seed state?')) {
      mockStore.resetDemo();
      loadData();
      setNotice({
        type: 'success',
        message: 'Demo database reset to default baseline seed state.',
      });
    }
  };

  // Mock Deterministic Audit Trail
  const auditRecords = [
    {
      id: 'AUD-9021',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      actor: 'system.engine@emaanak',
      action: 'MPE_TOLERANCE_EVALUATION',
      entity: 'VerificationInspection',
      ref: 'insp-001',
      result: 'PASS',
      details: 'Evaluated 3 test points against NAWI v1.0 MPE threshold (±0.0100 kg). Conformance verified.',
    },
    {
      id: 'AUD-9020',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      actor: 'officer.rajesh@emaanak.gov.in',
      action: 'CERTIFICATE_GENERATION',
      entity: 'Certificate',
      ref: 'CERT-2026-INSP-9981',
      result: 'COMMITTED',
      details: 'Issued cryptographic QR token and signed certificate for Mettler Toledo IND570.',
    },
    {
      id: 'AUD-9019',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      actor: 'owner@emaanak.demo',
      action: 'APPLICATION_SUBMISSION',
      entity: 'VerificationApplication',
      ref: 'app-002',
      result: 'SUBMITTED',
      details: 'Lodged verification request for Sartorius AG Quintix 513-1S.',
    },
    {
      id: 'AUD-9018',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      actor: 'admin@emaanak.gov.in',
      action: 'STATUTORY_RULE_UPDATE',
      entity: 'ToleranceRule',
      ref: 'WEIGHING_SCALE_V1',
      result: 'ACTIVE',
      details: 'Synchronized Rule Version 1.0 test point schedules (20%, 50%, 100% capacity).',
    },
  ];

  // Certificate Table Columns
  const certColumns: ColumnDef<any>[] = [
    {
      header: 'Certificate Reference',
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-gov-navy text-xs block">{row.certificateNumber}</span>
          <span className="text-[10px] text-slate-500 font-mono">Token: {row.qrToken}</span>
        </div>
      ),
      sortable: true,
      sortValue: (r) => r.certificateNumber,
    },
    {
      header: 'Equipment',
      accessor: (row) => (
        <div>
          <strong className="block text-slate-800">{row.instrument?.model}</strong>
          <span className="font-mono text-[10.5px] text-slate-500">S/N: {row.instrument?.serialNumber}</span>
        </div>
      ),
    },
    {
      header: 'Custodian',
      accessor: (row) => <span className="text-slate-700">{row.applicantName || 'Sovereign Agro Logistics'}</span>,
    },
    {
      header: 'Validity Span',
      accessor: (row) => (
        <div className="text-[11px]">
          <span className="text-slate-500 block">
            Issued: {new Date(row.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          <span className="font-semibold text-slate-800">
            Expires: {new Date(row.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortValue: (r) => r.status,
    },
    {
      header: 'Administrative Action',
      accessor: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setPreviewCert(row)}
            type="button"
            className="gov-btn-secondary py-0.5 px-2 text-[10.5px]"
          >
            Preview
          </button>
          {row.status === 'VALID' ? (
            <button
              onClick={() => handleOpenRevokeModal(row.certificateNumber)}
              type="button"
              className="gov-btn-danger py-0.5 px-2 text-[10.5px]"
            >
              Revoke
            </button>
          ) : (
            <span className="text-[10px] text-rose-700 font-semibold px-1">Revoked</span>
          )}
        </div>
      ),
    },
  ];

  // Instrument Table Columns
  const instrumentColumns: ColumnDef<any>[] = [
    {
      header: 'Serial Number',
      accessor: (row) => <span className="font-mono font-bold text-gov-navy">{row.serialNumber}</span>,
      sortable: true,
      sortValue: (r) => r.serialNumber,
    },
    {
      header: 'Category',
      accessor: (row) => <span>{row.type?.replace(/_/g, ' ')}</span>,
    },
    {
      header: 'Manufacturer & Model',
      accessor: (row) => (
        <div>
          <strong className="block text-slate-800">{row.model}</strong>
          <span className="text-slate-500 text-[11px]">{row.manufacturer}</span>
        </div>
      ),
    },
    {
      header: 'Capacity',
      accessor: (row) => <span>{row.ratedCapacity || 'Standard'}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortValue: (r) => r.status,
    },
  ];

  // Rules Table Columns
  const ruleColumns: ColumnDef<any>[] = [
    {
      header: 'Rule Code',
      accessor: (row) => <span className="font-mono font-bold text-gov-navy">{row.ruleCode}</span>,
    },
    {
      header: 'Version',
      accessor: (row) => <span className="font-mono font-bold text-emerald-800">v{row.ruleVersion}</span>,
    },
    {
      header: 'Instrument Type',
      accessor: (row) => <span>{row.instrumentType?.replace(/_/g, ' ')}</span>,
    },
    {
      header: 'Tolerance Specification',
      accessor: (row) => (
        <span className="font-mono text-[11px] text-slate-700">
          Absolute: ±{row.toleranceConfig?.absoluteTolerance || '0.0100'} | Relative: {row.toleranceConfig?.relativeTolerancePercent || '0.05'}%
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (row) => <span className="text-slate-600 text-xs">{row.description}</span>,
    },
  ];

  // Audit Table Columns
  const auditColumns: ColumnDef<any>[] = [
    {
      header: 'Audit ID & Time',
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-gov-navy text-[11px] block">{row.id}</span>
          <span className="text-[10px] text-slate-500">
            {new Date(row.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      header: 'Actor',
      accessor: (row) => <span className="font-mono text-slate-700 text-xs">{row.actor}</span>,
    },
    {
      header: 'Action Executed',
      accessor: (row) => <span className="font-semibold text-slate-900 text-xs">{row.action}</span>,
    },
    {
      header: 'Target Entity',
      accessor: (row) => (
        <span className="font-mono text-slate-600 text-[11px]">
          {row.entity} ({row.ref})
        </span>
      ),
    },
    {
      header: 'Result',
      accessor: (row) => <StatusBadge status={row.result} />,
    },
    {
      header: 'Audit Telemetry Details',
      accessor: (row) => <span className="text-slate-600 text-[11px]">{row.details}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Directorate Administrative Console"
        description="Central regulatory oversight, statutory tolerance rules engine, nationwide certificate revocation registry, and system audit telemetry."
        breadcrumbs={[{ label: 'Administrative Portal' }, { label: 'Directorate Oversight' }]}
        badge={
          <span className="text-[10px] font-semibold font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-300 rounded-xs uppercase">
            Legal Metrology Root Authority
          </span>
        }
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetDemo}
              type="button"
              className="gov-btn-secondary text-xs"
              title="Reset mock database to initial seed"
            >
              🔄 Reset Demo Database
            </button>
          </div>
        }
      />

      {/* Notifications */}
      {notice && (
        <Alert
          type={notice.type}
          title={notice.type === 'success' ? 'Administrative Action Recorded' : 'System Error'}
          onClose={() => setNotice(null)}
        >
          {notice.message}
        </Alert>
      )}

      {/* Administrative Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Registered Instruments
          </span>
          <div className="text-xl font-bold text-gov-navy mt-1 font-mono">{instruments.length}</div>
          <span className="text-[10.5px] text-slate-500 block mt-0.5">Commercial equipment census</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-gov-blue uppercase tracking-wider">
            Active Applications
          </span>
          <div className="text-xl font-bold text-gov-blue mt-1 font-mono">{applications.length}</div>
          <span className="text-[10.5px] text-slate-500 block mt-0.5">Verification requests lodged</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            Valid Compliance Certificates
          </span>
          <div className="text-xl font-bold text-emerald-900 mt-1 font-mono">
            {certificates.filter((c) => c.status === 'VALID').length}
          </div>
          <span className="text-[10.5px] text-slate-500 block mt-0.5">Legally authorized for trade</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-rose-800 uppercase tracking-wider">
            Revoked Certificates
          </span>
          <div className="text-xl font-bold text-rose-900 mt-1 font-mono">
            {certificates.filter((c) => c.status === 'REVOKED').length}
          </div>
          <span className="text-[10.5px] text-slate-500 block mt-0.5">De-certified / Voided records</span>
        </div>
      </div>

      {/* Navigation Tabs (Administrative Workspaces) */}
      <div className="border-b border-slate-300">
        <nav className="flex space-x-1" aria-label="Administrative Console Tabs">
          <button
            onClick={() => setAdminTab('overview')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              adminTab === 'overview'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Directorate Overview
          </button>

          <button
            onClick={() => setAdminTab('certificates')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              adminTab === 'certificates'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Certificates & Revocation ({certificates.length})
          </button>

          <button
            onClick={() => setAdminTab('instruments')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              adminTab === 'instruments'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Instruments Census ({instruments.length})
          </button>

          <button
            onClick={() => setAdminTab('rules')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              adminTab === 'rules'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Statutory Rules ({rules.length})
          </button>

          <button
            onClick={() => setAdminTab('audit')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              adminTab === 'audit'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Audit Telemetry ({auditRecords.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Status Panel */}
            <div className="bg-white border border-slate-300 p-4 rounded-xs shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
                Operational Synchronization & Health
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Verification Registry Status</span>
                  <span className="font-semibold text-emerald-800 flex items-center space-x-1">
                    <span>●</span>
                    <span>ONLINE (Local Node Verified)</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Tolerance Evaluation Engine</span>
                  <span className="font-mono text-slate-800">Deterministic MPE Rule Engine v1.0</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Offline Queue Cache</span>
                  <span className="font-mono text-slate-800">localStorage / In-Memory Mock Store</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Last System Sync</span>
                  <span className="font-mono text-slate-800">{new Date().toLocaleTimeString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Quick Revocation Tool */}
            <div className="bg-white border border-slate-300 p-4 rounded-xs shadow-xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-800 border-b border-slate-200 pb-2">
                Statutory Certificate Revocation Console
              </h2>
              <p className="text-xs text-slate-600">
                Immediately revoke a certificate by entering its official reference number and statutory justification.
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="e.g. CERT-2026-INSP-9981"
                  value={revokeCertNum}
                  onChange={(e) => setRevokeCertNum(e.target.value)}
                  className="gov-input font-mono text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => setIsRevokeModalOpen(true)}
                  disabled={!revokeCertNum.trim()}
                  className="gov-btn-danger text-xs font-bold uppercase whitespace-nowrap"
                >
                  Initiate Revocation
                </button>
              </div>
            </div>
          </div>

          {/* Recent Audit Telemetry Table */}
          <DataTable
            columns={auditColumns}
            data={auditRecords}
            keyExtractor={(row) => row.id}
            title="Recent Directorate Audit Activity"
            subtitle="Immutable chronological telemetry of verification actions and tolerance evaluations."
            pageSize={5}
          />
        </div>
      )}

      {/* TAB 2: CERTIFICATES & REVOCATION */}
      {adminTab === 'certificates' && (
        <DataTable
          columns={certColumns}
          data={certificates}
          keyExtractor={(row) => row.id}
          title="National Compliance Certificates Registry"
          subtitle="Directory of issued certificates with cryptographic tokens and revocation authority."
          searchPlaceholder="Search certificate number, token, serial number..."
          searchFilter={(row, q) =>
            row.certificateNumber.toLowerCase().includes(q) ||
            row.qrToken?.toLowerCase().includes(q) ||
            row.instrument?.serialNumber?.toLowerCase().includes(q)
          }
          pageSize={10}
        />
      )}

      {/* TAB 3: INSTRUMENTS */}
      {adminTab === 'instruments' && (
        <DataTable
          columns={instrumentColumns}
          data={instruments}
          keyExtractor={(row) => row.id}
          title="Commercial Measuring Instruments Census"
          subtitle="Statewide census of verified and registered measuring devices."
          searchPlaceholder="Search serial number, model, manufacturer..."
          searchFilter={(row, q) =>
            row.serialNumber.toLowerCase().includes(q) ||
            row.model.toLowerCase().includes(q) ||
            row.manufacturer.toLowerCase().includes(q)
          }
          pageSize={10}
        />
      )}

      {/* TAB 4: RULES */}
      {adminTab === 'rules' && (
        <DataTable
          columns={ruleColumns}
          data={rules}
          keyExtractor={(row) => row.id}
          title="Statutory Metrology Rules & Tolerances"
          subtitle="Mathematical criteria and Maximum Permissible Error (MPE) thresholds applied during inspection."
          pageSize={10}
        />
      )}

      {/* TAB 5: AUDIT */}
      {adminTab === 'audit' && (
        <DataTable
          columns={auditColumns}
          data={auditRecords}
          keyExtractor={(row) => row.id}
          title="Regulatory Audit Trail & Traceability Ledger"
          subtitle="Complete chronological audit records tracking officer inspections, rule modifications, and certificates."
          searchPlaceholder="Search actor, action, reference..."
          searchFilter={(row, q) =>
            row.actor.toLowerCase().includes(q) ||
            row.action.toLowerCase().includes(q) ||
            row.ref.toLowerCase().includes(q)
          }
          pageSize={10}
        />
      )}

      {/* Formal Revocation Modal */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Compliance Certificate"
        subtitle="Statutory de-certification of measuring instrument"
        maxWidth="md"
      >
        <form onSubmit={handleRevokeSubmit} className="space-y-4">
          <div className="bg-rose-50 p-3 rounded-xs border border-rose-300 text-xs text-rose-900 leading-relaxed">
            <strong className="block uppercase text-[11px] font-bold mb-1">
              Warning: Regulatory Invalidation Notice
            </strong>
            Revoking certificate <span className="font-mono font-bold">{revokeCertNum}</span> will immediately render the instrument non-compliant for commercial trade. The public verification registry will reflect status REVOKED.
          </div>

          <div>
            <label className="gov-label">
              Certificate Reference Number <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={revokeCertNum}
              onChange={(e) => setRevokeCertNum(e.target.value)}
              className="gov-input font-mono"
            />
          </div>

          <div>
            <label className="gov-label">
              Statutory Reason for Revocation <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Failure upon surprise field re-inspection; Broken security seal; Commercial fraud report."
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="gov-input"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRevokeModalOpen(false)}
              className="gov-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={revoking}
              className="gov-btn-danger font-bold uppercase text-xs"
            >
              {revoking ? 'Executing Revocation...' : 'Confirm Revocation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-4xl my-2 sm:my-4">
            <div className="print-hide absolute top-2 right-2 sm:top-3 sm:right-3 z-30">
              <button
                onClick={() => setPreviewCert(null)}
                className="bg-white hover:bg-slate-100 text-slate-800 p-2 rounded-xs shadow-md border border-slate-300 transition"
              >
                ✕ Close Preview
              </button>
            </div>
            <CertificateDocument
              data={previewCert}
              showToolbar={true}
              onClose={() => setPreviewCert(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
