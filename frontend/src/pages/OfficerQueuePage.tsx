import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatDateLocale } from '../i18n';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Alert } from '../components/common/Alert';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { CertificateDocument, CertificateData } from '../components/certificate/CertificateDocument';

interface ReadingRow {
  pointName: string;
  referenceLoad: string;
  observedValue: string;
}

export const OfficerQueuePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  // Inspection Form State
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [readings, setReadings] = useState<ReadingRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Certificate modal preview
  const [previewCert, setPreviewCert] = useState<CertificateData | null>(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const [queueRes, rulesRes] = await Promise.all([api.getQueue(), api.getRules()]);
      if (queueRes.data) setQueue(queueRes.data.applications);
      if (rulesRes.data) {
        setRules(rulesRes.data.rules);
        if (rulesRes.data.rules.length > 0) {
          setSelectedRuleId(rulesRes.data.rules[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load officer queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = (app: any) => {
    setSelectedApp(app);
    setInspectionResult(null);
    setNotification(null);

    // Pick appropriate rule based on instrument type
    const matchedRule =
      rules.find((r) => r.instrumentType === app.instrument?.type) || rules[0];
    const ruleId = matchedRule ? matchedRule.id : rules[0]?.id || '';
    setSelectedRuleId(ruleId);

    // Generate initial test points based on rule schedule
    const schedule = matchedRule?.testPointSchedule || [20, 50, 100];
    const initialReadings = schedule.map((pct: number, idx: number) => ({
      pointName: `Test Point ${idx + 1} (${pct}% Capacity)`,
      referenceLoad: `${pct}.0000`,
      observedValue: `${pct}.0000`,
    }));

    setReadings(initialReadings);
  };

  const handleReadingChange = (index: number, value: string) => {
    const updated = [...readings];
    updated[index].observedValue = value;
    setReadings(updated);
  };

  const currentRule = rules.find((r) => r.id === selectedRuleId);
  const absoluteTolerance = parseFloat(
    currentRule?.toleranceConfig?.absoluteTolerance || '0.01'
  );

  // Compute live reading calculations
  const evaluatedReadings = readings.map((r) => {
    const ref = parseFloat(r.referenceLoad) || 0;
    const obs = parseFloat(r.observedValue) || 0;
    const error = obs - ref;
    const pctError = ref !== 0 ? (error / ref) * 100 : 0;
    const isPass = Math.abs(error) <= absoluteTolerance;
    return {
      ...r,
      error,
      pctError,
      isPass,
    };
  });

  const allPassed = evaluatedReadings.every((r) => r.isPass);

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setNotification(null);
    try {
      const res = await api.performInspection({
        applicationId: selectedApp.id,
        ruleId: selectedRuleId,
        notes,
        readings: readings.map((r) => ({
          pointName: r.pointName,
          referenceLoad: r.referenceLoad,
          observedValue: r.observedValue,
        })),
      });

      if (res.data) {
        setInspectionResult(res.data);
        setNotification({
          type: 'success',
          message: `Verification inspection recorded successfully. Outcome: ${res.data.result}.`,
        });
        await loadQueue();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to submit verification inspection.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Queue Table Columns
  const queueColumns: ColumnDef<any>[] = [
    {
      header: t('owner.colAppRef'),
      accessor: (row) => <span className="font-mono font-bold text-gov-navy text-xs">{row.id}</span>,
      sortable: true,
      sortValue: (r) => r.id,
    },
    {
      header: t('owner.colEqInfo'),
      accessor: (row) => (
        <div>
          <strong className="block text-slate-900">{row.instrument?.model}</strong>
          <span className="font-mono text-[10.5px] text-slate-500">
            S/N: {row.instrument?.serialNumber}
          </span>
        </div>
      ),
    },
    {
      header: t('owner.colType'),
      accessor: (row) => (
        <span className="text-slate-700 text-xs">
          {row.instrument?.type?.replace(/_/g, ' ')}
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.instrument?.type,
    },
    {
      header: t('officer.colCustodian'),
      accessor: (row) => (
        <span className="text-slate-800 font-medium text-xs">
          {row.applicant?.fullName || 'Sovereign Agro Logistics Ltd'}
        </span>
      ),
    },
    {
      header: t('officer.colFilingDate'),
      accessor: (row) => (
        <span className="text-slate-600 text-xs">
          {formatDateLocale(row.createdAt)}
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.createdAt,
    },
    {
      header: t('owner.colAppStatus'),
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortValue: (r) => r.status,
    },
    {
      header: t('owner.colAction'),
      accessor: (row) => (
        <button
          onClick={() => handleStartInspection(row)}
          type="button"
          className="gov-btn-primary text-xs py-1 px-3 whitespace-nowrap"
        >
          {t('officer.inspectEquipment')}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title={t('officer.pageTitle')}
        description={t('officer.pageDesc')}
        breadcrumbs={[{ label: t('officer.officerPortal') }, { label: t('officer.fieldVerificationQueue') }]}
        badge={
          <span className="text-[10px] font-semibold font-mono bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-300 rounded-xs uppercase">
            {t('officer.authorizedWing')}
          </span>
        }
        actions={
          selectedApp ? (
            <button
              onClick={() => {
                setSelectedApp(null);
                setInspectionResult(null);
              }}
              type="button"
              className="gov-btn-secondary text-xs"
            >
              {t('officer.returnToQueue')}
            </button>
          ) : undefined
        }
      />

      {/* Notifications */}
      {notification && (
        <Alert
          type={notification.type}
          title={notification.type === 'success' ? 'Verification Recorded' : 'Inspection Error'}
          onClose={() => setNotification(null)}
        >
          {notification.message}
        </Alert>
      )}

      {/* Operational Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {t('officer.pendingQueue')}
          </span>
          <div className="text-xl font-bold text-amber-900 mt-1 font-mono">
            {queue.filter((q) => q.status === 'SUBMITTED' || q.status === 'PENDING').length}
          </div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">{t('officer.pendingDesc')}</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            {t('officer.completedInspections')}
          </span>
          <div className="text-xl font-bold text-emerald-900 mt-1 font-mono">
            {queue.filter((q) => q.status === 'CERTIFICATE_ISSUED').length}
          </div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">{t('officer.completedDesc')}</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-gov-navy uppercase tracking-wider">
            {t('officer.activeRules')}
          </span>
          <div className="text-xl font-bold text-gov-navy mt-1 font-mono">{rules.length}</div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">{t('officer.activeRulesDesc')}</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {t('officer.inspectingOfficer')}
          </span>
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {user?.fullName || 'Inspector Rajesh Kumar'}
          </div>
          <span className="text-[10.5px] text-slate-500 block">{t('officer.officerLab')}</span>
        </div>
      </div>

      {/* VIEW A: Queue Data Table (When no application is selected) */}
      {!selectedApp && (
        <DataTable
          columns={queueColumns}
          data={queue}
          keyExtractor={(row) => row.id}
          title={t('officer.assignedQueueTitle')}
          subtitle={t('officer.assignedQueueSubtitle')}
          searchPlaceholder={t('officer.searchPlaceholder')}
          searchFilter={(row, q) =>
            row.id.toLowerCase().includes(q) ||
            row.instrument?.serialNumber?.toLowerCase().includes(q) ||
            row.instrument?.model?.toLowerCase().includes(q) ||
            row.applicant?.fullName?.toLowerCase().includes(q)
          }
          loading={loading}
          emptyTitle={t('officer.emptyTitle')}
          emptyDescription={t('officer.emptyDesc')}
          pageSize={10}
        />
      )}

      {/* VIEW B: INSPECTION WORKBENCH (Operational Field Verification Interface) */}
      {selectedApp && (
        <div className="space-y-5">
          {/* Post-Inspection Result Banner if just completed */}
          {inspectionResult && (
            <div className="bg-white border-2 border-slate-800 p-4 rounded-xs shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    {t('officer.outcomeRecorded')}
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <h2 className="text-lg font-bold text-gov-navy">
                      Application {selectedApp.id}: {inspectionResult.result === 'PASS' ? 'VERIFIED' : 'NON-COMPLIANT'}
                    </h2>
                    <StatusBadge status={inspectionResult.result === 'PASS' ? 'VALID' : 'REJECTED'} />
                  </div>
                </div>

                {inspectionResult.certificate && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewCert(inspectionResult.certificate)}
                      type="button"
                      className="gov-btn-secondary text-xs"
                    >
                      {t('officer.previewCert')}
                    </button>
                    <Link
                      to={`/verify/${inspectionResult.certificate.qrToken}`}
                      className="gov-btn-primary text-xs"
                    >
                      {t('officer.publicRegistry')}
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-700">
                {inspectionResult.result === 'PASS' ? (
                  <p>
                    All multi-point test loads satisfied the Maximum Permissible Error (MPE) tolerance limits. Certificate Ref{' '}
                    <strong className="font-mono text-gov-navy">{inspectionResult.certificate?.certificateNumber}</strong> has been generated with a cryptographic QR token.
                  </p>
                ) : (
                  <p className="text-rose-800">
                    Measurement errors exceeded permissible statutory limits. The instrument cannot be legally certified for commercial trade.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Workbench Form Card */}
          <div className="bg-white border border-slate-300 rounded-xs shadow-xs p-5">
            <div className="border-b border-slate-300 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {t('officer.workbenchTitle')}
                </span>
                <h2 className="text-base font-bold text-gov-navy">
                  {t('officer.workbenchActive')} — {selectedApp.instrument?.model}
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-xs border border-slate-300">
                Application: {selectedApp.id}
              </span>
            </div>

            <form onSubmit={handleSubmitInspection} className="space-y-5">
              {/* Part 1: Equipment & Rule Information Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xs border border-slate-200">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('officer.part1Category')}</span>
                  <strong className="text-slate-900">{selectedApp.instrument?.type?.replace(/_/g, ' ')}</strong>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('officer.part1Serial')}</span>
                  <strong className="font-mono text-gov-navy text-xs">{selectedApp.instrument?.serialNumber}</strong>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('officer.part1Manufacturer')}</span>
                  <span className="text-slate-800">{selectedApp.instrument?.manufacturer}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">{t('officer.part1Custodian')}</span>
                  <span className="text-slate-800">{selectedApp.applicant?.fullName || 'Sovereign Agro Logistics Ltd'}</span>
                </div>
              </div>

              {/* Part 2: Applicable Statutory Rule Selector */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label htmlFor="statutory-rule" className="gov-label mb-0">
                    {t('officer.ruleCriteria')} <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {t('officer.toleranceSpecs', { abs: absoluteTolerance, pct: '0.05' })}
                  </span>
                </div>

                <select
                  id="statutory-rule"
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  className="gov-select font-mono"
                >
                  {rules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.ruleCode} (v{rule.ruleVersion}) — {rule.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Part 3: Test Point Calibration Grid */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {t('officer.testLoadRecord')}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {t('officer.testLoadDesc')}
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xs">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>{t('officer.colPoint')}</th>
                        <th>{t('officer.colRefMass')}</th>
                        <th>{t('officer.colObsReading')}</th>
                        <th>{t('officer.colAbsError')}</th>
                        <th>{t('officer.colRelError')}</th>
                        <th className="text-center">{t('officer.colPermissible')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {evaluatedReadings.map((reading, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold text-slate-800">{reading.pointName}</td>
                          <td className="font-mono text-slate-700">{reading.referenceLoad}</td>
                          <td className="w-36">
                            <input
                              type="number"
                              step="0.0001"
                              required
                              value={reading.observedValue}
                              onChange={(e) => handleReadingChange(idx, e.target.value)}
                              className="gov-input font-mono text-xs py-1"
                            />
                          </td>
                          <td className="font-mono text-slate-800">
                            {reading.error > 0 ? `+${reading.error.toFixed(4)}` : reading.error.toFixed(4)}
                          </td>
                          <td className="font-mono text-slate-800">
                            {reading.pctError.toFixed(4)}%
                          </td>
                          <td className="text-center">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-xs uppercase ${
                                reading.isPass
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {reading.isPass ? '✓ PASS' : '✕ FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Part 4: Verification Summary & Remarks */}
              <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="officer-notes" className="gov-label">
                    {t('officer.officerNotes')}
                  </label>
                  <textarea
                    id="officer-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('officer.notesPlaceholder')}
                    className="gov-input text-xs"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-300 p-3 rounded-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      {t('officer.mpeAssessment')}
                    </span>
                    <div className="mt-1 flex items-center space-x-2">
                      <span
                        className={`text-base font-extrabold uppercase tracking-tight ${
                          allPassed ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {allPassed ? t('officer.overallPassed') : t('officer.overallFailed')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {allPassed ? t('officer.allPassedDesc') : t('officer.anyFailedDesc')}
                    </p>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    {t('officer.signedBy', { name: user?.fullName || 'Inspector Rajesh Kumar' })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="gov-btn-secondary"
                >
                  {t('officer.cancelWorkbench')}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`gov-btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider ${
                    !allPassed ? 'bg-rose-700 hover:bg-rose-800' : ''
                  }`}
                >
                  {submitting
                    ? t('officer.submittingVerification')
                    : allPassed
                    ? t('officer.completeVerification')
                    : t('officer.recordRejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-4xl my-2 sm:my-4">
            <div className="print-hide absolute top-2 right-2 sm:top-3 sm:right-3 z-30">
              <button
                onClick={() => setPreviewCert(null)}
                className="bg-white hover:bg-slate-100 text-slate-800 p-2 rounded-xs shadow-md border border-slate-300 transition"
              >
                {t('officer.closePreview')}
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
