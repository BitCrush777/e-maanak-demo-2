import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { mockStore } from '../services/mockData';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Revocation state
  const [revokeCertNum, setRevokeCertNum] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertNum || !revokeReason.trim()) return;

    setRevoking(true);
    try {
      const res = await api.revokeCertificate(revokeCertNum, revokeReason);
      if (res.data) {
        setNotice(`Certificate ${revokeCertNum} revoked successfully.`);
        setRevokeCertNum(null);
        setRevokeReason('');
        await loadData();
      }
    } catch (e) {
      console.error('Revocation error:', e);
    } finally {
      setRevoking(false);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data (instruments, inspections, certificates) to clean default state?')) {
      mockStore.resetDemo();
      loadData();
      setNotice('Demo database reset to default seed state.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-sovereign-navy">
              Legal Metrology Directorate Oversight
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-emerald-100 text-emerald-800 font-semibold">
              Root Authority
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            System administration, statutory tolerance rules, and nationwide verification registry.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
        >
          🔄 Reset Demo Environment
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex justify-between items-center">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Instruments
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{instruments.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            Verification Applications
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{applications.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Active Certificates
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {certificates.filter((c) => c.status === 'VALID').length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
            Revoked Certificates
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {certificates.filter((c) => c.status === 'REVOKED').length}
          </div>
        </div>
      </div>

      {/* Statutory Rules Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Statutory Metrological Rules & Permissible Tolerances
          </h2>
          <span className="text-xs text-slate-500">{rules.length} Active Specs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sovereign-navy text-sm">
                  {r.ruleCode}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                  v{r.ruleVersion} ACTIVE
                </span>
              </div>

              <p className="text-slate-600 line-clamp-2">{r.description}</p>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div>
                  <span className="text-slate-400">Absolute Tolerance:</span>{' '}
                  <strong className="text-slate-800 font-mono">
                    ±{r.toleranceConfig?.absoluteTolerance}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Percentage Tolerance:</span>{' '}
                  <strong className="text-slate-800 font-mono">
                    {r.toleranceConfig?.percentageTolerance}%
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Test Point Schedule:</span>{' '}
                  <span className="font-mono text-slate-700">
                    [{r.testPointSchedule?.join('%, ')}%]
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Registry & Revocation Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            National Certificate Registry ({certificates.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold">
              <tr>
                <th className="px-4 py-3">Certificate Number</th>
                <th className="px-4 py-3">Instrument</th>
                <th className="px-4 py-3">Serial No</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-sovereign-navy">
                    {cert.certificateNumber}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {cert.instrument?.model}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">
                    {cert.instrument?.serialNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(cert.expiryDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cert.status === 'VALID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to={`/verify/${cert.qrToken}`}
                      className="text-sovereign-brass hover:underline font-semibold"
                    >
                      View QR
                    </Link>
                    {cert.status === 'VALID' && (
                      <button
                        onClick={() => setRevokeCertNum(cert.certificateNumber)}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Modal */}
      {revokeCertNum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-rose-800">
              Revoke Digital Metrology Certificate
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Revoking Certificate <strong className="font-mono">{revokeCertNum}</strong> will immediately invalidate it across the public trust registry.
            </p>

            <form onSubmit={handleRevoke} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mandatory Statutory Reason for Revocation
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Broken lead seal detected during surprise market inspection."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRevokeCertNum(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revoking}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  {revoking ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
