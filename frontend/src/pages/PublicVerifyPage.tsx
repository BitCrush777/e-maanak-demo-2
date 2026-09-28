import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { PageHeader } from '../components/common/PageHeader';
import { Alert } from '../components/common/Alert';
import { CertificateDocument, CertificateData } from '../components/certificate/CertificateDocument';

export const PublicVerifyPage: React.FC = () => {
  const { t } = useTranslation();
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
        setErrorMsg(res.error?.message || 'Verification record not found in the national registry.');
        setVerifyData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with metrology verification registry node.');
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
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Page Header (Hidden in Print) */}
      <div className="print-hide">
        <PageHeader
          title={t('verify.pageTitle')}
          description={t('verify.pageDesc')}
          breadcrumbs={[{ label: t('nav.publicVerify') }, { label: t('common.verifyCert') }]}
          badge={
            <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 border border-slate-300 rounded-xs uppercase">
              {t('verify.registryNode')}
            </span>
          }
        />
      </div>

      {/* Search & Lookup Form (Hidden in Print) */}
      <div className="print-hide bg-white p-4 rounded-xs border border-slate-300 shadow-xs">
        <div className="border-b border-slate-200 pb-2 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs font-bold text-gov-navy uppercase tracking-wide">
            {t('verify.searchTitle')}
          </h2>
          <span className="text-[10.5px] text-slate-500 font-mono">
            {t('verify.searchSubtitle')}
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('verify.searchPlaceholder')}
              className="gov-input font-mono text-xs py-2"
            />
          </div>
          <button
            type="submit"
            className="gov-btn-primary font-bold uppercase text-xs py-2 px-5"
          >
            {t('verify.verifyButton')}
          </button>
        </form>

        <div className="mt-2.5 text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700">{t('verify.sampleTokensLabel')}</span>
          <button
            type="button"
            onClick={() => navigate('/verify/demo-qr-token-1')}
            className="text-gov-navy hover:underline font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300"
          >
            demo-qr-token-1
          </button>
          <button
            type="button"
            onClick={() => navigate('/verify/CERT-2026-INSP-9981')}
            className="text-gov-navy hover:underline font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-300"
          >
            CERT-2026-INSP-9981
          </button>
        </div>
      </div>

      {/* Status & Results */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xs border border-slate-300 shadow-xs">
          <div className="inline-block animate-spin w-8 h-8 border-2 border-gov-navy border-t-transparent rounded-full mb-3" />
          <p className="text-sm font-bold text-slate-800">
            {t('verify.querying')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {t('verify.validatingCrypto')}
          </p>
        </div>
      ) : errorMsg || !certificate ? (
        <div className="bg-white p-8 rounded-xs border border-rose-300 shadow-xs text-center space-y-3">
          <div className="w-10 h-10 bg-rose-50 text-rose-700 rounded-xs flex items-center justify-center mx-auto text-xl font-bold border border-rose-300">
            ✕
          </div>
          <h2 className="text-base font-bold text-slate-900">{t('verify.notFoundTitle')}</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {verifyData?.message || errorMsg || t('common.noRecords')}
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xs max-w-lg mx-auto text-left text-xs text-amber-900">
            <strong className="block uppercase text-[10.5px] font-bold mb-0.5">
              {t('verify.noticeTitle')}
            </strong>
            {t('verify.noticeBody')}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Certificate Document (Strict A4 Layout) */}
          <CertificateDocument data={certificate} showToolbar={true} />

          {/* Technical Compliance & Audit Telemetry (Hidden in Print) */}
          <div className="print-hide bg-white rounded-xs border border-slate-300 shadow-xs p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy">
                  {t('verify.telemetryTitle')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t('verify.telemetrySubtitle')}
                </p>
              </div>
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                type="button"
                className="gov-btn-secondary text-[11px] py-1 px-2.5"
              >
                {showTechnicalDetails ? t('verify.hideAuditLog') : t('verify.showAuditLog')}
              </button>
            </div>

            {showTechnicalDetails && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('owner.colRuleRef')}</span>
                    <strong className="text-slate-900 font-mono text-xs">{certificate.ruleCode}</strong>
                    <span className="block text-slate-600 text-[10.5px]">{t('admin.colVersion')}: {certificate.ruleVersion}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('verify.toleranceSchedule')}</span>
                    <strong className="text-slate-900 font-mono text-xs">NAWI Standard MPE</strong>
                    <span className="block text-slate-600 text-[10.5px]">Limit: ±0.05% error</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('verify.cryptoSeal')}</span>
                    <strong className="text-slate-900 font-mono text-xs">HMAC SHA-256</strong>
                    <span className="block text-emerald-800 font-semibold text-[10.5px]">{t('verify.verifiedAuthentic')}</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-200 p-3 rounded-xs font-mono text-[11px] overflow-x-auto">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">{t('verify.rawPayload')}</div>
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
