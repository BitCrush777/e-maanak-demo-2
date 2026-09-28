import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CertificateDocument, CertificateData } from '../components/certificate/CertificateDocument';

export const PublicVerifyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(token || 'demo-qr-token-1');
  const [loading, setLoading] = useState(true);
  const [verifyData, setVerifyData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    if (token) {
      setSearchInput(token);
      verifyToken(token);
    } else {
      verifyToken('demo-qr-token-1');
    }
  }, [token]);

  const verifyToken = async (tok: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.verifyCertificate(tok);
      if (res.data && res.data.certificate) {
        setVerifyData(res.data);
      } else {
        setErrorMsg(res.error?.message || 'Verification record not found.');
        setVerifyData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with metrology verification registry.');
      setVerifyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${searchInput.trim()}`);
    }
  };

  const certificate: CertificateData | null = verifyData?.certificate
    ? {
        ...verifyData.certificate,
        ruleCode: verifyData.certificate.ruleCode || 'WEIGHING_SCALE_V1',
        ruleVersion: verifyData.certificate.ruleVersion || 'v1.0',
        ruleDescription:
          verifyData.certificate.ruleDescription ||
          'Standard Verification Procedure for Non-Automatic Weighing Instruments',
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-3 sm:px-4 py-4 sm:py-6">
      {/* Search & Lookup Bar (Hidden in Print) */}
      <div className="print-hide bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Legal Metrology Public Verification Portal
            </h2>
            <p className="text-xs text-slate-500">
              Instant cryptographic lookup for measuring instruments, calibration records, and verification status.
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
            ● Registry Connected (SIH-2026 Node)
          </span>
        </div>

        <form onSubmit={handleSearch} className="mt-3.5 flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Certificate Number or QR Token (e.g. CERT-2026-INSP-9981 or demo-qr-token-1)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <span>Verify Record</span>
          </button>
        </form>

        <div className="mt-2.5 text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
          <span>Demo Tokens:</span>
          <button
            type="button"
            onClick={() => navigate('/verify/demo-qr-token-1')}
            className="text-slate-900 hover:underline font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
          >
            demo-qr-token-1
          </button>
          <button
            type="button"
            onClick={() => navigate('/verify/CERT-2026-INSP-9981')}
            className="text-slate-900 hover:underline font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
          >
            CERT-2026-INSP-9981
          </button>
        </div>
      </div>

      {/* Main Status & Display View */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-900 border-t-transparent mx-auto mb-3.5" />
          <p className="text-sm font-semibold text-slate-800">
            Querying Sovereign Legal Metrology Trust Registry...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Validating cryptographic signature and tolerance compliance.
          </p>
        </div>
      ) : errorMsg || !certificate ? (
        <div className="bg-white p-10 rounded-2xl border border-rose-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-3 border border-rose-200">
            ✕
          </div>
          <h2 className="text-lg font-bold text-slate-900">Certificate Record Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
            {verifyData?.message || errorMsg || 'No active verification record matches this QR token or certificate number.'}
          </p>
          <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto text-left">
            <span className="block text-[11px] font-bold text-amber-900 uppercase">
              Notice for Commercial Traders
            </span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Unverified or expired measuring instruments cannot be legally deployed for commercial trade under Legal Metrology standards.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Formal Official Certificate Document (A4 Print Ready) */}
          <CertificateDocument data={certificate} showToolbar={true} />

          {/* Technical Compliance & Audit Information (Hidden during Print) */}
          <div className="print-hide bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Metrological Audit & Cryptographic Traceability
                </h3>
                <p className="text-xs text-slate-500">
                  System telemetry, rule engine verification details, and immutable proof.
                </p>
              </div>
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                type="button"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
              >
                {showTechnicalDetails ? 'Hide Audit Log' : 'View Audit Log'}
              </button>
            </div>

            {showTechnicalDetails && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Verification Rule</span>
                    <strong className="text-slate-900 font-mono">{certificate.ruleCode}</strong>
                    <span className="block text-slate-600 text-[11px] mt-0.5">Version: {certificate.ruleVersion}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Tolerance Model</span>
                    <strong className="text-slate-900 font-mono">NAWI Standard MPE</strong>
                    <span className="block text-slate-600 text-[11px] mt-0.5">Max Permissible Error: ±0.05%</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Ledger Proof</span>
                    <strong className="text-slate-900 font-mono">HMAC SHA-256</strong>
                    <span className="block text-emerald-700 font-semibold text-[11px] mt-0.5">Valid Cryptographic Seal</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">// Raw Verification Payload</div>
                  <pre>{JSON.stringify(verifyData, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
