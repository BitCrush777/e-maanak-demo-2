import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

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

    // Pick appropriate rule based on instrument type
    const matchedRule =
      rules.find((r) => r.instrumentType === app.instrument?.type) || rules[0];
    const ruleId = matchedRule ? matchedRule.id : rules[0]?.id || '';
    setSelectedRuleId(ruleId);

    // Generate initial test points based on rule schedule
    const schedule = matchedRule?.testPointSchedule || [20, 50, 100];
    const initialReadings = schedule.map((pct: number, idx: number) => ({
      pointName: `Point ${idx + 1} (${pct}% Capacity Test)`,
      referenceLoad: `${pct}.0000`,
      observedValue: `${pct}.0000`, // Default exact match for quick inspection
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
        await loadQueue();
      }
    } catch (err) {
      console.error('Inspection submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-sovereign-navy">
              Field Metrology Inspection Portal
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-100 text-blue-800 font-semibold">
              Authorized Enforcement
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Inspecting Officer: <strong className="text-slate-800">{user?.fullName}</strong> (Zone-04 Metrology Wing)
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Offline Inspection Sync Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Applications Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Pending Inspection Queue ({queue.length})
            </h2>
            <button
              onClick={loadQueue}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              🔄 Refresh
            </button>
          </div>

          {queue.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
              <span className="text-2xl block mb-2">🎉</span>
              No pending inspection requests in this jurisdiction queue.
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleStartInspection(app)}
                  className={`p-4 rounded-xl border cursor-pointer transition shadow-sm ${
                    selectedApp?.id === app.id
                      ? 'border-sovereign-navy bg-blue-50/50 ring-2 ring-sovereign-navy/10'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                        {app.instrument?.type}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {app.instrument?.model}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Applicant: <span className="font-semibold">{app.applicant?.fullName}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500 font-mono">
                    <span>S/N: {app.instrument?.serialNumber}</span>
                    <span className="text-sovereign-navy font-bold">Select to Inspect →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Metrological Testing Workbench */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Inspection Workbench
                    </span>
                    <h2 className="text-lg font-bold text-sovereign-navy">
                      {selectedApp.instrument?.model} (S/N: {selectedApp.instrument?.serialNumber})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Owner: {selectedApp.applicant?.fullName} • {selectedApp.instrument?.manufacturer}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {inspectionResult ? (
                <div className="p-6 text-center space-y-4">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl mb-2 ${
                      inspectionResult.result === 'PASS'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {inspectionResult.result === 'PASS' ? '✓' : '✕'}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    Inspection Outcome:{' '}
                    <span
                      className={
                        inspectionResult.result === 'PASS'
                          ? 'text-emerald-700'
                          : 'text-rose-700'
                      }
                    >
                      {inspectionResult.result === 'PASS' ? 'PASSED & COMPLIANT' : 'FAILED NON-COMPLIANCE'}
                    </span>
                  </h3>

                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    {inspectionResult.message}
                  </p>

                  {inspectionResult.certificate && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left max-w-md mx-auto text-xs space-y-2">
                      <div className="font-bold text-emerald-900 text-sm">
                        📜 Official Certificate Generated
                      </div>
                      <div>
                        Certificate Number:{' '}
                        <strong className="font-mono text-slate-900">
                          {inspectionResult.certificate.certificateNumber}
                        </strong>
                      </div>
                      <div>
                        QR Token Identifier:{' '}
                        <span className="font-mono text-slate-600">
                          {inspectionResult.certificate.qrToken}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Link
                          to={`/verify/${inspectionResult.certificate.qrToken}`}
                          className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs shadow transition"
                        >
                          Open & Print Public Certificate →
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSelectedApp(null);
                        setInspectionResult(null);
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                    >
                      Back to Queue
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitInspection} className="p-5 space-y-5">
                  {/* Select Statutory Rule */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Statutory Rule & Tolerance Standard
                    </label>
                    <select
                      value={selectedRuleId}
                      onChange={(e) => setSelectedRuleId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                    >
                      {rules.map((rule) => (
                        <option key={rule.id} value={rule.id}>
                          {rule.ruleCode} — {rule.description} (Tol: ±
                          {rule.toleranceConfig?.absoluteTolerance})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tolerance Threshold Banner */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-900">Permissible Error Limit:</span>{' '}
                      <span className="font-mono text-amber-800">
                        ±{currentRule?.toleranceConfig?.absoluteTolerance} units (or{' '}
                        {currentRule?.toleranceConfig?.percentageTolerance}%)
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        allPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {allPassed ? '✓ Readings In Tolerance' : '✕ Out of Tolerance'}
                    </span>
                  </div>

                  {/* Test Points Table */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Test Load Calibration Readings
                    </label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                          <tr>
                            <th className="px-3 py-2">Test Point</th>
                            <th className="px-3 py-2">Ref Load</th>
                            <th className="px-3 py-2">Observed Value</th>
                            <th className="px-3 py-2 font-mono">Error (Obs - Ref)</th>
                            <th className="px-3 py-2 text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {evaluatedReadings.map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {r.pointName}
                              </td>
                              <td className="px-3 py-2 font-mono text-slate-700">
                                {r.referenceLoad}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={r.observedValue}
                                  onChange={(e) => handleReadingChange(idx, e.target.value)}
                                  className="w-24 px-2 py-1 border border-slate-300 rounded font-mono font-semibold text-slate-900 focus:ring-1 focus:ring-sovereign-navy outline-none"
                                />
                              </td>
                              <td className="px-3 py-2 font-mono font-semibold">
                                <span
                                  className={
                                    r.isPass ? 'text-emerald-700' : 'text-rose-700'
                                  }
                                >
                                  {r.error >= 0 ? `+${r.error.toFixed(4)}` : r.error.toFixed(4)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    r.isPass
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {r.isPass ? 'PASS' : 'FAIL'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Officer Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Inspector Verification Notes
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Test performed with Class F1 reference weights. Seal intact."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:ring-2 focus:ring-sovereign-navy"
                    />
                  </div>

                  {/* Submission Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                      Overall Assessment:{' '}
                      <strong className={allPassed ? 'text-emerald-700' : 'text-rose-700'}>
                        {allPassed ? 'Qualifies for Certificate' : 'Rejection Notice will be issued'}
                      </strong>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow transition disabled:opacity-50 ${
                        allPassed
                          ? 'bg-emerald-700 hover:bg-emerald-800'
                          : 'bg-rose-700 hover:bg-rose-800'
                      }`}
                    >
                      {submitting
                        ? 'Recording...'
                        : allPassed
                        ? 'Approve & Issue Certificate 📜'
                        : 'Submit Rejection Report ✕'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
              <span className="text-3xl block mb-2">⚖️</span>
              <h3 className="font-semibold text-slate-700 text-base">
                No Application Selected
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select an application from the queue on the left to begin metrological tolerance inspection and digital verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
