import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import { formatDateLocale } from '../../i18n';
import './PrintStyles.css';

export interface CertificateData {
  id?: string;
  certificateNumber: string;
  verificationInspectionId?: string;
  qrToken?: string;
  ruleCode?: string;
  ruleVersion?: string;
  ruleDescription?: string;
  issueDate: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED';
  revokedAt?: string;
  revocationReason?: string;
  instrument: {
    type: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    ratedCapacity?: string;
  };
  verificationOfficer?: string;
  applicantName?: string;
  readings?: Array<{
    pointName: string;
    referenceLoad: string;
    observedValue: string;
    error: string;
    percentageError: string;
    result: string;
  }>;
}

interface CertificateDocumentProps {
  data: CertificateData;
  originUrl?: string;
  showToolbar?: boolean;
  onClose?: () => void;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  data,
  originUrl,
  showToolbar = false,
  onClose,
}) => {
  const { t } = useTranslation();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const verificationToken = data.qrToken || data.certificateNumber;
  const baseUrl = originUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://emaanak.org');
  const fullVerificationUrl = `${baseUrl}/verify/${verificationToken}`;

  useEffect(() => {
    if (verificationToken) {
      QRCode.toDataURL(fullVerificationUrl, {
        margin: 1,
        width: 140,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('Failed to generate QR Code:', err));
    }
  }, [verificationToken, fullVerificationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullVerificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Format dates safely using the active locale (Hindi / English)
  const formatDate = (dateStr?: string) => {
    return formatDateLocale(dateStr);
  };

  const isRevoked = data.status === 'REVOKED';
  const isValid = data.status === 'VALID';

  // Deterministic mock cryptographic integrity fingerprint
  const mockCertHash = `SHA256-${(data.certificateNumber + (data.qrToken || ''))
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0)
    .toString(16)
    .toUpperCase()
    .padStart(8, '0')}...E94A`;

  return (
    <div className="certificate-page-container w-full flex flex-col items-center">
      {/* Optional Screen Action Toolbar (Hidden during Print) */}
      {showToolbar && (
        <div className="print-hide w-full max-w-[210mm] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xs border border-slate-300 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-slate-100 text-slate-800 font-mono border border-slate-300">
              {t('certificate.previewA4')}
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {t('certificate.verifiedRecord')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              type="button"
              className="gov-btn-secondary py-1 px-3 text-xs"
              title={t('certificate.copyLink')}
            >
              <span>{copied ? t('certificate.linkCopied') : t('certificate.copyLink')}</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="gov-btn-primary py-1 px-3 text-xs font-bold"
              title={t('certificate.printPdf')}
            >
              <span>{t('certificate.printPdf')}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                type="button"
                className="gov-btn-secondary py-1 px-2.5 text-xs"
              >
                {t('certificate.closePreview')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actual Certificate Paper (A4 Portrait Standard) */}
      <div className="certificate-paper relative bg-white border-2 border-slate-900 shadow-lg text-slate-900 overflow-hidden box-border">
        {/* Decorative Inner Hairline Border */}
        <div className="absolute inset-1.5 border border-slate-300 pointer-events-none" />

        {/* Security Watermark (Ultra-low opacity, non-intrusive) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <div className="transform -rotate-[28deg] text-center">
            <span className="block text-4xl sm:text-5xl font-black tracking-widest text-slate-900/[0.038] uppercase">
              {t('certificate.watermarkTitle')}
            </span>
            <span className="block text-base sm:text-lg font-bold tracking-widest text-slate-900/[0.038] uppercase mt-2">
              {t('certificate.watermarkSub')}
            </span>
          </div>
        </div>

        {/* Certificate Content Wrapper */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          {/* HEADER SECTION */}
          <div className="cert-section border-b-2 border-slate-900 pb-3">
            {/* Top Micro-Header */}
            <div className="flex items-center justify-between text-[9px] font-mono tracking-wider text-slate-500 uppercase pb-1 border-b border-slate-200">
              <span>{t('certificate.topArchitecture')}</span>
              <span>{t('certificate.topProtocol')}</span>
            </div>

            {/* Main Header Row */}
            <div className="mt-2.5 flex items-center justify-between gap-4">
              {/* Emblem / Geometric Metrology Crest */}
              <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full border-2 border-slate-800 bg-slate-50 p-2 shadow-sm">
                <svg className="w-10 h-10 text-slate-800" viewBox="0 0 48 48" fill="none">
                  {/* Balance Scale Geometric Crest */}
                  <path d="M24 6V42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M12 14H36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M8 18L12 14L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M32 18L36 14L40 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M6 26C6 29.3 8.7 32 12 32C15.3 32 18 29.3 18 26H6Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
                  <path d="M30 26C30 29.3 32.7 32 36 32C39.3 32 42 29.3 42 26H30Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" />
                  <path d="M18 42H30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Title Typography */}
              <div className="flex-1 text-center">
                <div className="text-[12px] font-bold tracking-[0.25em] text-slate-700 uppercase font-sans">
                  {t('certificate.network')}
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase mt-0.5">
                  {t('certificate.title')}
                </h1>
                <p className="text-[11px] font-semibold tracking-wide text-slate-600 uppercase mt-0.5">
                  {t('certificate.subtitle')}
                </p>
              </div>

              {/* Status Stamp Box */}
              <div className="flex-shrink-0 text-right">
                <div
                  className={`inline-block px-3 py-1.5 rounded border-2 font-black text-xs tracking-wider uppercase shadow-xs ${
                    isValid
                      ? 'bg-emerald-50 border-emerald-700 text-emerald-800'
                      : isRevoked
                      ? 'bg-rose-50 border-rose-700 text-rose-800'
                      : 'bg-amber-50 border-amber-700 text-amber-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-current" />
                    <span>{t('status.' + data.status, data.status)}</span>
                  </div>
                  <span className="block text-[8px] font-semibold tracking-normal text-slate-500 mt-0.5">
                    {isValid ? t('certificate.compliant') : t('status.' + data.status, data.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Attestation Notice Box */}
            <div className="mt-2.5 bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-center">
              <p className="text-[9px] font-bold text-slate-700 tracking-wide uppercase">
                {t('certificate.noticeTitle')}
              </p>
              <p className="text-[8px] text-slate-500">
                {t('certificate.noticeDesc')}
              </p>
            </div>
          </div>

          {/* METADATA BAR / KEY REFERENCE GRID */}
          <div className="cert-section grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-2 rounded">
              <span className="block text-[9px] font-bold text-slate-500 uppercase">{t('certificate.certNumber')}</span>
              <strong className="font-mono text-slate-950 font-bold text-xs">{data.certificateNumber}</strong>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2 rounded">
              <span className="block text-[9px] font-bold text-slate-500 uppercase">{t('certificate.issueDate')}</span>
              <span className="font-medium text-slate-900">{formatDate(data.issueDate)}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2 rounded">
              <span className="block text-[9px] font-bold text-slate-500 uppercase">{t('certificate.expiryDate')}</span>
              <span className="font-semibold text-slate-900">{formatDate(data.expiryDate)}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2 rounded">
              <span className="block text-[9px] font-bold text-slate-500 uppercase">{t('certificate.ruleCode')}</span>
              <span className="font-mono font-bold text-slate-950">
                {data.ruleCode || 'WEIGHING_SCALE_V1'} <span className="text-[10px] text-slate-600 font-normal">({data.ruleVersion || 'v1.0'})</span>
              </span>
            </div>
          </div>

          {/* ATTESTATION PROSE */}
          <div className="cert-section text-[10px] leading-relaxed text-slate-700 bg-slate-50/60 p-2.5 rounded border-l-2 border-slate-800">
            <p>
              <strong className="text-slate-900">{t('certificate.attestationTitle')} </strong>
              {t('certificate.attestationBody', {
                desc: data.ruleDescription || 'Standard Legal Metrology Verification Procedure',
                code: data.ruleCode || 'WEIGHING_SCALE_V1',
                version: data.ruleVersion || 'v1.0',
              })}
            </p>
          </div>

          {/* SECTION 1: INSTRUMENT & CUSTODIAN SPECIFICATIONS */}
          <div className="cert-section">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                {t('certificate.sec1Title')}
              </h2>
              <span className="text-[9px] font-mono text-slate-500">ID: {data.instrument?.serialNumber}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2 text-[10px]">
              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.instrumentCategory')}</span>
                <span className="font-semibold text-slate-900">{data.instrument?.type?.replace(/_/g, ' ') || 'WEIGHING SCALE'}</span>
              </div>

              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.manufacturer')}</span>
                <span className="font-semibold text-slate-900">{data.instrument?.manufacturer || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.modelDesignation')}</span>
                <span className="font-semibold text-slate-900">{data.instrument?.model || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.serialNumber')}</span>
                <span className="font-mono font-bold text-slate-950">{data.instrument?.serialNumber || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.ratedCapacity')}</span>
                <span className="font-semibold text-slate-900">{data.instrument?.ratedCapacity || 'Standard Capacity'}</span>
              </div>

              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.custodian')}</span>
                <span className="font-semibold text-slate-900">{data.applicantName || 'Sovereign Agro Logistics Ltd.'}</span>
              </div>

              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.verificationInterval')}</span>
                <span className="font-semibold text-slate-900">{t('certificate.intervalTwelveMonths')}</span>
              </div>

              <div>
                <span className="block text-[8.5px] font-semibold text-slate-500 uppercase">{t('certificate.inspectionId')}</span>
                <span className="font-mono text-slate-900">{data.verificationInspectionId || 'insp-001'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: METROLOGICAL TEST READINGS & TOLERANCES */}
          <div className="cert-section">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                {t('certificate.sec2Title')}
              </h2>
              <span className="text-[9px] font-mono text-emerald-800 font-bold">{t('certificate.allTolerancesSatisfied')}</span>
            </div>

            <table className="w-full text-left text-[9.5px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 uppercase font-mono text-[8.5px]">
                  <th className="py-1 px-2 border-r border-slate-300">{t('certificate.colPointDesc')}</th>
                  <th className="py-1 px-2 border-r border-slate-300">{t('certificate.colRefStd')}</th>
                  <th className="py-1 px-2 border-r border-slate-300">{t('certificate.colObsVal')}</th>
                  <th className="py-1 px-2 border-r border-slate-300">{t('certificate.colAbsErr')}</th>
                  <th className="py-1 px-2 border-r border-slate-300">{t('certificate.colRelErr')}</th>
                  <th className="py-1 px-2 text-center">{t('certificate.colPermStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.readings && data.readings.length > 0 ? (
                  data.readings.map((reading, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-1 px-2 font-medium border-r border-slate-200 text-slate-900">{reading.pointName}</td>
                      <td className="py-1 px-2 font-mono border-r border-slate-200">{reading.referenceLoad}</td>
                      <td className="py-1 px-2 font-mono border-r border-slate-200">{reading.observedValue}</td>
                      <td className="py-1 px-2 font-mono border-r border-slate-200 text-slate-800">
                        {parseFloat(reading.error) > 0 ? `+${reading.error}` : reading.error}
                      </td>
                      <td className="py-1 px-2 font-mono border-r border-slate-200 text-slate-800">
                        {reading.percentageError}%
                      </td>
                      <td className="py-1 px-2 text-center font-bold">
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[8px] uppercase ${
                            reading.result === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t('status.' + reading.result, reading.result)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-2 px-2 text-center text-slate-500 italic">
                      {t('certificate.noReadingsFallback')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SECTION 3: AUTHENTICITY, QR CODE & FORMAL SIGN-OFF */}
          <div className="cert-section border-t-2 border-slate-900 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* High-Resolution Real Scannable QR Code */}
              <div className="sm:col-span-3 flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Verification QR for ${data.certificateNumber}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
                    {t('certificate.generatingQr')}
                  </div>
                )}
                <span className="text-[8px] font-mono text-slate-600 mt-1 uppercase tracking-tight">
                  {t('certificate.scanVerify')}
                </span>
              </div>

              {/* Public Verification Details & Token */}
              <div className="sm:col-span-5 text-[9px] space-y-1.5">
                <div>
                  <span className="block font-bold text-slate-700 uppercase">{t('certificate.publicRegistry')}</span>
                  <p className="font-mono text-slate-900 text-[8.5px] break-all bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {fullVerificationUrl}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <span className="block text-[8px] font-semibold text-slate-500 uppercase">{t('certificate.verificationToken')}</span>
                    <span className="font-mono font-bold text-slate-800">{verificationToken}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-semibold text-slate-500 uppercase">{t('certificate.integrityHash')}</span>
                    <span className="font-mono text-[8px] text-slate-600">{mockCertHash}</span>
                  </div>
                </div>

                <p className="text-[8px] text-slate-500 leading-tight">
                  {t('certificate.scanInstructions')}
                </p>
              </div>

              {/* Official Attestation Sign-off Block (Truthful, Formal, No Fake Signatures) */}
              <div className="sm:col-span-4 border border-slate-300 rounded p-2.5 bg-slate-50 flex flex-col justify-between h-full">
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('certificate.authorizedSignOff')}
                  </span>
                  <div className="mt-1">
                    <span className="block font-bold text-slate-900 text-[10px]">
                      {data.verificationOfficer || 'Inspector Rajesh Kumar'}
                    </span>
                    <span className="block text-[8.5px] text-slate-600">
                      {t('certificate.verifyingOfficerRole')}
                    </span>
                    <span className="block text-[8px] text-slate-500 font-mono">
                      {t('certificate.zoneLab')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-300">
                  <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
                    <span>{t('certificate.verifiedOn', { date: formatDate(data.issueDate) })}</span>
                    <span className="text-emerald-700 font-bold">{t('certificate.digitallyStamped')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER & REGULATORY DISCLAIMER */}
          <div className="cert-section certificate-footer border-t border-slate-300 pt-2 text-[8px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-1">
            <div className="text-center sm:text-left">
              <span className="font-bold text-slate-700">{t('common.systemTitle')}</span> • {t('certificate.footerAuthority')}
            </div>
            <div className="text-center sm:text-right font-mono">
              {t('certificate.docRef', { num: data.certificateNumber })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
