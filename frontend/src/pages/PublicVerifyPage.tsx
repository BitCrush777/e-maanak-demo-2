import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const PublicVerifyPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(token || 'demo-qr-token-1');
  const [loading, setLoading] = useState(true);
  const [verifyData, setVerifyData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (token) {
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
      if (res.data) {
        setVerifyData(res.data);
      } else {
        setErrorMsg(res.error?.message || 'Verification lookup failed.');
        setVerifyData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with verification node.');
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

  const handlePrint = () => {
    window.print();
  };

  const certificate = verifyData?.certificate;
  const status = verifyData?.status;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search / Scan QR Input Bar (Hidden in Print) */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Certificate Number or Scan QR Token (e.g. demo-qr-token-1)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-sovereign-navy outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-sovereign-navy hover:bg-blue-900 text-white font-semibold text-sm rounded-lg shadow transition"
          >
            Verify Certificate
          </button>
        </form>

        <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-2">
          <span>Try demo tokens:</span>
          <button
            type="button"
            onClick={() => navigate('/verify/demo-qr-token-1')}
            className="text-sovereign-brass hover:underline font-mono font-bold"
          >
            demo-qr-token-1
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sovereign-navy mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">
            Querying Sovereign Legal Metrology Trust Registry...
          </p>
        </div>
      ) : errorMsg || !verifyData || status === 'INVALID' ? (
        <div className="bg-white p-8 rounded-xl border border-red-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
            ✕
          </div>
          <h2 className="text-xl font-bold text-slate-900">Certificate Not Found</h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            {verifyData?.message || errorMsg || 'No record matches this QR token or certificate number.'}
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Caution: Uncertified measuring instruments cannot be legally used for commercial trade under the Legal Metrology Act, 2009.
          </p>
        </div>
      ) : (
        /* Official Certificate Display Container */
        <div className="bg-white border-4 border-double border-sovereign-navy/80 rounded-2xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
          {/* Sovereign Security Watermark (Decorative background) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <div className="text-center font-black text-9xl text-sovereign-navy select-none rotate-[-25deg]">
              ई-मानक
            </div>
          </div>

          {/* Certificate Header */}
          <div className="text-center border-b-2 border-slate-200 pb-6 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sovereign-navy text-white text-xl font-bold mb-2 shadow border-2 border-sovereign-brass">
              मान
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-sovereign-navy tracking-tight uppercase">
              Government of India
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide uppercase mt-0.5">
              Directorate of Legal Metrology • Verification Division
            </p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              [Issued under Section 24 of the Legal Metrology Act, 2009]
            </p>

            {/* Status Stamp */}
            <div className="mt-4 flex justify-center">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 shadow-sm ${
                  status === 'VALID'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-500'
                    : status === 'EXPIRED'
                    ? 'bg-amber-50 text-amber-800 border-amber-500'
                    : 'bg-rose-50 text-rose-800 border-rose-500'
                }`}
              >
                ● STATUS: {status}
              </span>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="mt-6 space-y-6 relative z-10">
            {/* Meta bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs gap-3">
              <div>
                <span className="text-slate-400 block font-semibold">CERTIFICATE NUMBER:</span>
                <span className="font-mono font-bold text-sm text-sovereign-navy">
                  {certificate?.certificateNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">QR AUTHENTICATION TOKEN:</span>
                <span className="font-mono text-slate-700">{token || certificate?.qrToken}</span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-slate-400 block font-semibold">STATUS:</span>
                <span className="font-bold text-emerald-700">VERIFIED AUTHENTIC</span>
              </div>
            </div>

            {/* Instrument Specification Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 mb-3">
                1. Verified Instrument Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block">Category:</span>
                  <strong className="text-slate-900">{certificate?.instrument?.type}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block">Manufacturer:</span>
                  <strong className="text-slate-900">{certificate?.instrument?.manufacturer}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block">Model Name:</span>
                  <strong className="text-slate-900">{certificate?.instrument?.model}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block">Serial Number:</span>
                  <strong className="text-sovereign-navy font-mono">
                    {certificate?.instrument?.serialNumber}
                  </strong>
                </div>
              </div>
            </div>

            {/* Testing & Validity Period */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 mb-3">
                2. Metrological Validity Period
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block">Date of Verification:</span>
                  <strong className="text-slate-800">
                    {certificate?.issueDate &&
                      new Date(certificate.issueDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                  </strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block">Valid Until:</span>
                  <strong className="text-emerald-800 font-bold">
                    {certificate?.expiryDate &&
                      new Date(certificate.expiryDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                  </strong>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block">Authorized Inspector:</span>
                  <strong className="text-slate-800">{certificate?.verificationOfficer}</strong>
                </div>
              </div>
            </div>

            {/* Readings Table if available */}
            {certificate?.readings && certificate.readings.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2 mb-3">
                  3. Official Test Point Calibration Record
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-3 py-2">Test Point</th>
                        <th className="px-3 py-2">Ref Load</th>
                        <th className="px-3 py-2">Observed Load</th>
                        <th className="px-3 py-2 font-mono">Error</th>
                        <th className="px-3 py-2 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {certificate.readings.map((r: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-slate-800">{r.pointName}</td>
                          <td className="px-3 py-2 font-mono">{r.referenceLoad}</td>
                          <td className="px-3 py-2 font-mono">{r.observedValue}</td>
                          <td className="px-3 py-2 font-mono text-emerald-700 font-bold">
                            {r.error}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-700">
                            {r.result}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Legal Notice */}
            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-4 leading-relaxed">
              <p>
                <strong>Legal Certification:</strong> This document certifies that the instrument described above has been inspected and tested according to the standards prescribed under the Legal Metrology Act, 2009 and Rules framed thereunder, and found to be in compliance with the permissible error limits.
              </p>
            </div>
          </div>

          {/* Action Bar (Hidden in Print) */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between print:hidden">
            <span className="text-xs text-slate-400 font-mono">
              Cryptographically verified via SIH26036 prototype node
            </span>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-sovereign-navy hover:bg-blue-900 text-white text-xs font-bold rounded-lg shadow transition flex items-center space-x-1.5"
            >
              <span>🖨️</span>
              <span>Print Official Certificate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
