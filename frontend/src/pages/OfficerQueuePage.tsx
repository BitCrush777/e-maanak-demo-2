import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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
      header: 'Application Ref',
      accessor: (row) => <span className="font-mono font-bold text-gov-navy text-xs">{row.id}</span>,
      sortable: true,
      sortValue: (r) => r.id,
    },
    {
      header: 'Measuring Instrument',
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
      header: 'Category',
      accessor: (row) => (
        <span className="text-slate-700 text-xs">
          {row.instrument?.type?.replace(/_/g, ' ')}
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.instrument?.type,
    },
    {
      header: 'Custodian / Business',
      accessor: (row) => (
        <span className="text-slate-800 font-medium text-xs">
          {row.applicant?.fullName || 'Sovereign Agro Logistics Ltd'}
        </span>
      ),
    },
    {
      header: 'Filing Date',
      accessor: (row) => (
        <span className="text-slate-600 text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
      sortable: true,
      sortValue: (r) => r.createdAt,
    },
    {
      header: 'Current Status',
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortValue: (r) => r.status,
    },
    {
      header: 'Action',
      accessor: (row) => (
        <button
          onClick={() => handleStartInspection(row)}
          type="button"
          className="gov-btn-primary text-xs py-1 px-3 whitespace-nowrap"
        >
          Inspect Equipment →
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Field Metrology Verification Queue"
        description="Official operational workbench for authorized legal metrology officers. Perform tolerance testing, evaluate Maximum Permissible Error (MPE) conformance, and issue certificates."
        breadcrumbs={[{ label: 'Officer Portal' }, { label: 'Field Verification Queue' }]}
        badge={
          <span className="text-[10px] font-semibold font-mono bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-300 rounded-xs uppercase">
            Authorized Enforcement Wing
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
              ← Return to Queue List
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
            Pending in Queue
          </span>
          <div className="text-xl font-bold text-amber-900 mt-1 font-mono">
            {queue.filter((q) => q.status === 'SUBMITTED' || q.status === 'PENDING').length}
          </div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">Scheduled for field testing</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            Completed Inspections
          </span>
          <div className="text-xl font-bold text-emerald-900 mt-1 font-mono">
            {queue.filter((q) => q.status === 'CERTIFICATE_ISSUED').length}
          </div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">Certificates stamped & issued</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-gov-navy uppercase tracking-wider">
            Active Tolerance Rules
          </span>
          <div className="text-xl font-bold text-gov-navy mt-1 font-mono">{rules.length}</div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">Statutory models (v1.0)</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Inspecting Officer
          </span>
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {user?.fullName || 'Inspector Rajesh Kumar'}
          </div>
          <span className="text-[10.5px] text-slate-500 block">Zone-04 Metrological Laboratory</span>
        </div>
      </div>

      {/* VIEW A: Queue Data Table (When no application is selected) */}
      {!selectedApp && (
        <DataTable
          columns={queueColumns}
          data={queue}
          keyExtractor={(row) => row.id}
          title="Assigned Verification Applications"
          subtitle="List of commercial instruments submitted for legal metrology inspection."
          searchPlaceholder="Search application ref, serial number, model..."
          searchFilter={(row, q) =>
            row.id.toLowerCase().includes(q) ||
            row.instrument?.serialNumber?.toLowerCase().includes(q) ||
            row.instrument?.model?.toLowerCase().includes(q) ||
            row.applicant?.fullName?.toLowerCase().includes(q)
          }
          loading={loading}
          emptyTitle="Verification queue is clear"
          emptyDescription="There are currently no pending verification applications assigned to this queue."
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
                    Inspection Outcome Recorded
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
                      Preview Certificate
                    </button>
                    <Link
                      to={`/verify/${inspectionResult.certificate.qrToken}`}
                      className="gov-btn-primary text-xs"
                    >
                      Public Registry ↗
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
                  Form LM-02 • Verification Inspection Protocol
                </span>
                <h2 className="text-base font-bold text-gov-navy">
                  Active Inspection Workbench — {selectedApp.instrument?.model}
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
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Equipment Category</span>
                  <strong className="text-slate-900">{selectedApp.instrument?.type?.replace(/_/g, ' ')}</strong>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Serial Number</span>
                  <strong className="font-mono text-gov-navy text-xs">{selectedApp.instrument?.serialNumber}</strong>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Manufacturer</span>
                  <span className="text-slate-800">{selectedApp.instrument?.manufacturer}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Custodian Business</span>
                  <span className="text-slate-800">{selectedApp.applicant?.fullName || 'Sovereign Agro Logistics Ltd'}</span>
                </div>
              </div>

              {/* Part 2: Applicable Statutory Rule Selector */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label htmlFor="statutory-rule" className="gov-label mb-0">
                    Statutory Metrology Rule Criteria <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Absolute Tolerance: ±{absoluteTolerance} | Standard MPE: 0.05%
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
                    Multi-Point Test Load Calibration Record
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Enter physical test readings observed using certified standard weights.
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xs">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Test Point Description</th>
                        <th>Reference Mass (kg)</th>
                        <th>Observed Reading (kg)</th>
                        <th>Absolute Deviation</th>
                        <th>Relative Error (%)</th>
                        <th className="text-center">Permissible Status</th>
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
                    Inspecting Officer Notes / Laboratory Observations
                  </label>
                  <textarea
                    id="officer-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Verified using calibrated standard weights. Environmental temperature 24°C. Seal intact."
                    className="gov-input text-xs"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-300 p-3 rounded-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Automated Tolerance Assessment
                    </span>
                    <div className="mt-1 flex items-center space-x-2">
                      <span
                        className={`text-base font-extrabold uppercase tracking-tight ${
                          allPassed ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {allPassed ? 'OVERALL: PASSED (MPE SATISFIED)' : 'OVERALL: FAILED (OUT OF TOLERANCE)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {allPassed
                        ? 'All test points fall within statutory limits under Rule v1.0. A verification certificate will be generated upon submission.'
                        : 'One or more test points exceed maximum permissible error. Instrument cannot be approved.'}
                    </p>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    Signed by: {user?.fullName || 'Inspector Rajesh Kumar'} (Zone-04)
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
                  Cancel & Exit Workbench
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`gov-btn-primary py-2 px-5 text-xs font-bold uppercase tracking-wider ${
                    !allPassed ? 'bg-rose-700 hover:bg-rose-800' : ''
                  }`}
                >
                  {submitting
                    ? 'Submitting Verification...'
                    : allPassed
                    ? 'Complete Verification & Issue Certificate'
                    : 'Record Verification Rejection (Failed)'}
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
