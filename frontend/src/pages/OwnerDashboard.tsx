import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { CertificateDocument, CertificateData } from '../components/certificate/CertificateDocument';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'instruments' | 'applications' | 'certificates'>('instruments');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'WEIGHING_SCALE',
    manufacturer: '',
    model: '',
    serialNumber: '',
    ratedCapacity: '',
    verificationInterval: 12,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [instRes, appRes, certRes] = await Promise.all([
        api.getInstruments(),
        api.getApplications(),
        api.getCertificates(),
      ]);

      if (instRes.data) setInstruments(instRes.data.instruments);
      if (appRes.data) setApplications(appRes.data.applications);
      if (certRes.data) setCertificates(certRes.data.certificates);
    } catch (err) {
      console.error('Failed to load owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterInstrument = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    setNotification(null);

    try {
      const res = await api.createInstrument(formData);
      if (res.data) {
        setNotification({
          type: 'success',
          message: `Instrument ${formData.model} (S/N: ${formData.serialNumber}) registered successfully!`,
        });
        setIsModalOpen(false);
        setFormData({
          type: 'WEIGHING_SCALE',
          manufacturer: '',
          model: '',
          serialNumber: '',
          ratedCapacity: '',
          verificationInterval: 12,
        });
        await loadData();
      } else {
        setNotification({
          type: 'error',
          message: res.error?.message || 'Registration failed.',
        });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error occurred.' });
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleApplyVerification = async (instrumentId: string) => {
    setNotification(null);
    try {
      const res = await api.createApplication(instrumentId);
      if (res.data) {
        setNotification({
          type: 'success',
          message: 'Verification application submitted! Metrology officers can now inspect it.',
        });
        await loadData();
        setActiveTab('applications');
      } else {
        setNotification({ type: 'error', message: res.error?.message || 'Failed to submit.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error submitting application.' });
    }
  };

  const filteredInstruments = instruments.filter((inst) => {
    const matchesSearch =
      inst.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? inst.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Verified</span>;
      case 'PENDING_VERIFICATION':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-300">⏳ Verification Pending</span>;
      case 'FAILED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300">✕ Non-Compliant</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-300">Registered</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-sovereign-navy">Owner Instrument Dashboard</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-100 text-blue-800 font-semibold">
              Regulated Business Portal
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Registered Entity: <strong className="text-slate-700">{user?.fullName || 'Demo Agro Logistics Ltd'}</strong> ({user?.email})
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-sovereign-navy hover:bg-blue-900 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition"
        >
          <span className="mr-1.5 text-base font-bold">+</span> Register New Instrument
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Instruments
          </div>
          <div className="text-3xl font-extrabold text-sovereign-navy mt-2">
            {instruments.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Legally registered with metrology office</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            In Verification Pipeline
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {instruments.filter((i) => i.status === 'PENDING_VERIFICATION').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Awaiting field officer inspection</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Active Valid Certificates
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {certificates.filter((c) => c.status === 'VALID').length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Digitally stamped & QR verified</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('instruments')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'instruments'
                ? 'border-sovereign-navy text-sovereign-navy font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            My Instruments ({instruments.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'applications'
                ? 'border-sovereign-navy text-sovereign-navy font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Applications ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'certificates'
                ? 'border-sovereign-navy text-sovereign-navy font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Certificates Issued ({certificates.length})
          </button>
        </nav>
      </div>

      {/* Tab 1: Instruments Catalog */}
      {activeTab === 'instruments' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by serial number, manufacturer, or model..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-sovereign-navy outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-sovereign-navy outline-none"
            >
              <option value="">All Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Instrument Details</th>
                    <th className="px-6 py-3.5">Serial Number</th>
                    <th className="px-6 py-3.5">Capacity</th>
                    <th className="px-6 py-3.5">Legal Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInstruments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No instruments match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInstruments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{inst.model}</div>
                          <div className="text-xs text-slate-500">
                            {inst.manufacturer} • <span className="font-mono text-slate-600">{inst.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-medium text-slate-800">
                          {inst.serialNumber}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {inst.ratedCapacity || 'Standard'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(inst.status)}</td>
                        <td className="px-6 py-4 text-right">
                          {inst.status === 'REGISTERED' && (
                            <button
                              onClick={() => handleApplyVerification(inst.id)}
                              className="px-3 py-1.5 bg-sovereign-brass hover:bg-amber-700 text-white rounded text-xs font-semibold transition shadow-sm"
                            >
                              Apply for Verification
                            </button>
                          )}
                          {inst.status === 'VERIFIED' && (
                            <Link
                              to="/verify/demo-qr-token-1"
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded text-xs font-semibold inline-block transition"
                            >
                              View Certificate 📜
                            </Link>
                          )}
                          {inst.status === 'PENDING_VERIFICATION' && (
                            <span className="text-xs text-amber-700 font-medium">In Queue</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Applications Tracker */}
      {activeTab === 'applications' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Application ID</th>
                  <th className="px-6 py-3.5">Target Instrument</th>
                  <th className="px-6 py-3.5">Submitted On</th>
                  <th className="px-6 py-3.5">Workflow Status</th>
                  <th className="px-6 py-3.5 text-right">Inspection Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-slate-800 font-semibold">
                      {app.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{app.instrument?.model}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        S/N: {app.instrument?.serialNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-sovereign-navy border border-blue-200">
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {app.inspection?.result === 'PASS' ? (
                        <span className="text-xs font-bold text-emerald-700">PASSED (Certified)</span>
                      ) : app.inspection?.result === 'FAIL' ? (
                        <span className="text-xs font-bold text-rose-700">FAILED</span>
                      ) : (
                        <span className="text-xs text-slate-400">Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Certificates */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border-2 border-slate-200 hover:border-sovereign-brass rounded-xl p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Digital Legal Metrology Certificate
                    </span>
                    <h3 className="font-bold text-lg text-sovereign-navy font-mono">
                      {cert.certificateNumber}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      cert.status === 'VALID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cert.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Instrument:</span>
                    <strong className="text-slate-800">{cert.instrument?.model}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Serial Number:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {cert.instrument?.serialNumber}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block">Valid Until:</span>
                    <span className="font-semibold text-emerald-800">
                      {new Date(cert.expiryDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-400 block">Issuing Officer:</span>
                    <span className="text-slate-700">{cert.verificationOfficer}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1 text-xs text-slate-500 font-mono">
                  <span>QR:</span>
                  <span className="truncate max-w-[120px]">{cert.qrToken}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    type="button"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                  >
                    Preview / Print
                  </button>
                  <Link
                    to={`/verify/${cert.qrToken}`}
                    className="px-3 py-1.5 bg-sovereign-navy text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition flex items-center space-x-1"
                  >
                    <span>Verify</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Instrument Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-sovereign-navy">
                Register New Measuring Instrument
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterInstrument} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instrument Classification
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                >
                  <option value="WEIGHING_SCALE">Electronic Weighing Scale</option>
                  <option value="PRESSURE_GAUGE">Industrial Pressure Gauge</option>
                  <option value="VOLUMETRIC_MEASURE">Volumetric Dispensing Measure</option>
                  <option value="FLOW_METER">Industrial Flow Meter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Sartorius, WIKA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. Model Quintix-50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serial Number (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="SN-2026-XXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rated Capacity / Range
                  </label>
                  <input
                    type="text"
                    value={formData.ratedCapacity}
                    onChange={(e) => setFormData({ ...formData, ratedCapacity: e.target.value })}
                    placeholder="e.g. 50 kg / 10 bar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Statutory Re-verification Period
                </label>
                <select
                  value={formData.verificationInterval}
                  onChange={(e) =>
                    setFormData({ ...formData, verificationInterval: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                >
                  <option value={12}>Every 12 Months (Annual)</option>
                  <option value={24}>Every 24 Months (Biennial)</option>
                  <option value={6}>Every 6 Months (Biannual)</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 bg-sovereign-navy text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition disabled:opacity-50"
                >
                  {modalSubmitting ? 'Registering...' : 'Register Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Full Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-4xl my-2 sm:my-4">
            <div className="print-hide absolute top-2 right-2 sm:top-3 sm:right-3 z-30">
              <button
                onClick={() => setSelectedCert(null)}
                className="bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 p-2 rounded-full shadow-lg border border-slate-300 transition"
                title="Close Certificate Preview"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CertificateDocument
              data={selectedCert}
              showToolbar={true}
              onClose={() => setSelectedCert(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
