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
import { Modal } from '../components/common/Modal';
import { CertificateDocument, CertificateData } from '../components/certificate/CertificateDocument';

export const OwnerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'instruments' | 'applications' | 'certificates'>('instruments');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Register Modal State
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

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  // Apply Verification loading
  const [applyingId, setApplyingId] = useState<string | null>(null);

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
          message: `Instrument ${formData.model} (${formData.serialNumber}) registered successfully.`,
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
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to register measuring instrument.',
      });
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleApplyVerification = async (instrumentId: string) => {
    setApplyingId(instrumentId);
    setNotification(null);
    try {
      const res = await api.createApplication(instrumentId);
      if (res.data) {
        setNotification({
          type: 'success',
          message: 'Verification application submitted to metrology queue.',
        });
        await loadData();
        setActiveTab('applications');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to submit verification application.',
      });
    } finally {
      setApplyingId(null);
    }
  };

  // Filter instruments
  const filteredInstruments = instruments.filter((inst) => {
    if (statusFilter && inst.status !== statusFilter) return false;
    if (typeFilter && inst.type !== typeFilter) return false;
    return true;
  });

  // Table Columns Definitions
  const instrumentColumns: ColumnDef<any>[] = [
    {
      header: t('owner.colType'),
      accessor: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">
            {row.type?.replace(/_/g, ' ')}
          </span>
          <span className="text-[10.5px] text-slate-500 font-mono">Ref: {row.id}</span>
        </div>
      ),
      sortable: true,
      sortValue: (r) => r.type,
    },
    {
      header: t('owner.colModel'),
      accessor: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.model}</span>
          <span className="text-[11px] text-slate-500">{row.manufacturer}</span>
        </div>
      ),
      sortable: true,
      sortValue: (r) => r.model,
    },
    {
      header: t('owner.colSerial'),
      accessor: (row) => <span className="font-mono font-bold text-gov-navy text-xs">{row.serialNumber}</span>,
      sortable: true,
      sortValue: (r) => r.serialNumber,
    },
    {
      header: t('owner.colCapacity'),
      accessor: (row) => <span>{row.ratedCapacity || 'Standard'}</span>,
    },
    {
      header: t('owner.colStatus'),
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortValue: (r) => r.status,
    },
    {
      header: t('owner.colAction'),
      accessor: (row) => {
        const hasActiveApp = applications.some(
          (a) => a.instrumentId === row.id && a.status !== 'REJECTED' && a.status !== 'CERTIFICATE_ISSUED'
        );

        if (hasActiveApp) {
          return (
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-300 rounded-xs">
              {t('owner.inReview')}
            </span>
          );
        }

        if (row.status === 'VERIFIED') {
          return (
            <button
              onClick={() => setActiveTab('certificates')}
              type="button"
              className="text-[11px] font-semibold text-emerald-800 hover:underline"
            >
              {t('owner.viewCert')}
            </button>
          );
        }

        return (
          <button
            onClick={() => handleApplyVerification(row.id)}
            disabled={applyingId === row.id}
            type="button"
            className="gov-btn-primary text-[11px] py-1 px-2.5"
          >
            {applyingId === row.id ? t('owner.submitting') : t('owner.applyVerification')}
          </button>
        );
      },
    },
  ];

  const applicationColumns: ColumnDef<any>[] = [
    {
      header: t('owner.colAppRef'),
      accessor: (row) => <span className="font-mono font-bold text-gov-navy">{row.id}</span>,
      sortable: true,
      sortValue: (r) => r.id,
    },
    {
      header: t('owner.colEqInfo'),
      accessor: (row) => (
        <div>
          <strong className="block text-slate-900">{row.instrument?.model || 'Equipment'}</strong>
          <span className="font-mono text-[10.5px] text-slate-500">
            S/N: {row.instrument?.serialNumber}
          </span>
        </div>
      ),
    },
    {
      header: t('owner.colSubmitted'),
      accessor: (row) => (
        <span className="text-slate-700">
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
      header: t('owner.colOutcome'),
      accessor: (row) => {
        if (row.inspection?.result === 'PASS') {
          return <span className="text-emerald-800 font-bold text-xs">{t('owner.passedCertified')}</span>;
        }
        if (row.inspection?.result === 'FAIL') {
          return <span className="text-rose-700 font-bold text-xs">{t('owner.failed')}</span>;
        }
        return <span className="text-slate-400 text-xs">{t('owner.awaitingOfficer')}</span>;
      },
    },
  ];

  const certificateColumns: ColumnDef<any>[] = [
    {
      header: t('owner.colCertRef'),
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
      header: t('owner.colEqInfo'),
      accessor: (row) => (
        <div>
          <strong className="block text-slate-800">{row.instrument?.model}</strong>
          <span className="font-mono text-[10.5px] text-slate-500">
            S/N: {row.instrument?.serialNumber}
          </span>
        </div>
      ),
    },
    {
      header: t('owner.colRuleRef'),
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-800">
          {row.ruleCode || 'WEIGHING_SCALE_V1'} <span className="text-slate-500">({row.ruleVersion || 'v1.0'})</span>
        </span>
      ),
    },
    {
      header: t('owner.colValidity'),
      accessor: (row) => (
        <div className="text-xs">
          <span className="block text-slate-600">
            {t('owner.issuedOn')}: {formatDateLocale(row.issueDate)}
          </span>
          <span className="font-semibold text-emerald-800">
            {t('owner.expiresOn')}: {formatDateLocale(row.expiryDate)}
          </span>
        </div>
      ),
    },
    {
      header: t('owner.colStatus'),
      accessor: (row) => <StatusBadge status={row.status} />,
      sortable: true,
      sortValue: (r) => r.status,
    },
    {
      header: t('owner.colAction'),
      accessor: (row) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setSelectedCert(row)}
            type="button"
            className="gov-btn-secondary py-1 px-2 text-[11px]"
          >
            {t('owner.previewPrint')}
          </button>
          <Link
            to={`/verify/${row.qrToken}`}
            className="gov-btn-primary py-1 px-2 text-[11px]"
          >
            {t('owner.verify')}
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Institutional Page Header */}
      <PageHeader
        title={t('owner.pageTitle')}
        description={t('owner.pageDesc')}
        breadcrumbs={[{ label: t('owner.ownerServices') }, { label: t('owner.custodianInventory') }]}
        badge={
          <span className="text-[10px] font-semibold font-mono bg-slate-200 text-slate-800 px-2 py-0.5 border border-slate-300 rounded-xs">
            {t('owner.commercialCustodianBadge')}
          </span>
        }
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="gov-btn-primary text-xs uppercase tracking-wide font-bold"
          >
            {t('owner.registerButton')}
          </button>
        }
      />

      {/* Notifications */}
      {notification && (
        <Alert
          type={notification.type}
          title={notification.type === 'success' ? 'Operation Completed' : 'Operation Failed'}
          onClose={() => setNotification(null)}
        >
          {notification.message}
        </Alert>
      )}

      {/* Account & Inventory Summary Bar (Government Format) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {t('owner.totalInstruments')}
          </span>
          <div className="text-xl font-bold text-gov-navy mt-1 font-mono">{instruments.length}</div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">{t('owner.totalInstrumentsDesc')}</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            {t('owner.pipeline')}
          </span>
          <div className="text-xl font-bold text-amber-900 mt-1 font-mono">
            {instruments.filter((i) => i.status === 'PENDING_VERIFICATION').length}
          </div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">{t('owner.pipelineDesc')}</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            {t('owner.activeCerts')}
          </span>
          <div className="text-xl font-bold text-emerald-900 mt-1 font-mono">
            {certificates.filter((c) => c.status === 'VALID').length}
          </div>
          <span className="text-[10.5px] text-slate-500 mt-0.5 block">{t('owner.activeCertsDesc')}</span>
        </div>

        <div className="bg-white border border-slate-300 p-3 rounded-xs shadow-xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {t('owner.profile')}
          </span>
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            {user?.fullName || 'Sovereign Agro Logistics Ltd'}
          </div>
          <span className="text-[10.5px] text-slate-500 truncate block">{user?.email}</span>
        </div>
      </div>

      {/* Navigation Tabs (Institutional e-Governance Tabs) */}
      <div className="border-b border-slate-300">
        <nav className="flex space-x-1" aria-label="Portal Workspace Tabs">
          <button
            onClick={() => setActiveTab('instruments')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'instruments'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {t('owner.tabInstruments')} ({instruments.length})
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'applications'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {t('owner.tabApplications')} ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            type="button"
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'certificates'
                ? 'border-gov-navy text-gov-navy bg-white border-t border-l border-r border-slate-300'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {t('owner.tabCertificates')} ({certificates.length})
          </button>
        </nav>
      </div>

      {/* Tab 1: Instruments Catalog */}
      {activeTab === 'instruments' && (
        <DataTable
          columns={instrumentColumns}
          data={filteredInstruments}
          keyExtractor={(row) => row.id}
          title={t('owner.registryTitle')}
          subtitle={t('owner.registrySubtitle')}
          searchPlaceholder={t('owner.searchPlaceholderInst')}
          searchFilter={(row, q) =>
            row.serialNumber.toLowerCase().includes(q) ||
            row.manufacturer.toLowerCase().includes(q) ||
            row.model.toLowerCase().includes(q) ||
            row.type.toLowerCase().includes(q)
          }
          filterComponent={
            <div className="flex items-center space-x-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="gov-select py-1 text-xs"
              >
                <option value="">{t('owner.allCategories')}</option>
                <option value="WEIGHING_SCALE">Weighing Scale</option>
                <option value="PRESSURE_GAUGE">Pressure Gauge</option>
                <option value="FUEL_DISPENSER">Fuel Dispenser</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="gov-select py-1 text-xs"
              >
                <option value="">{t('owner.allStatuses')}</option>
                <option value="REGISTERED">Registered</option>
                <option value="PENDING_VERIFICATION">Pending Verification</option>
                <option value="VERIFIED">Verified</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          }
          loading={loading}
          emptyTitle={t('owner.emptyTitleInst')}
          emptyDescription={t('owner.emptyDescInst')}
          emptyAction={
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="gov-btn-primary"
            >
              {t('owner.registerConfirm')}
            </button>
          }
          pageSize={8}
        />
      )}

      {/* Tab 2: Applications */}
      {activeTab === 'applications' && (
        <DataTable
          columns={applicationColumns}
          data={applications}
          keyExtractor={(row) => row.id}
          title={t('owner.appTitle')}
          subtitle={t('owner.appSubtitle')}
          searchPlaceholder={t('owner.searchPlaceholderApp')}
          searchFilter={(row, q) =>
            row.id.toLowerCase().includes(q) ||
            row.instrument?.serialNumber?.toLowerCase().includes(q) ||
            row.status.toLowerCase().includes(q)
          }
          loading={loading}
          emptyTitle={t('owner.emptyTitleApp')}
          emptyDescription={t('owner.emptyDescApp')}
          pageSize={8}
        />
      )}

      {/* Tab 3: Certificates */}
      {activeTab === 'certificates' && (
        <DataTable
          columns={certificateColumns}
          data={certificates}
          keyExtractor={(row) => row.id}
          title={t('owner.certTitle')}
          subtitle={t('owner.certSubtitle')}
          searchPlaceholder={t('owner.searchPlaceholderCert')}
          searchFilter={(row, q) =>
            row.certificateNumber.toLowerCase().includes(q) ||
            row.qrToken?.toLowerCase().includes(q) ||
            row.instrument?.serialNumber?.toLowerCase().includes(q)
          }
          loading={loading}
          emptyTitle={t('owner.emptyTitleCert')}
          emptyDescription={t('owner.emptyDescCert')}
          pageSize={8}
        />
      )}

      {/* Registration Modal: Form Organised into Government Service Sections */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('owner.regModalTitle')}
        subtitle={t('owner.regModalSubtitle')}
        maxWidth="2xl"
      >
        <form onSubmit={handleRegisterInstrument} className="space-y-4">
          {/* Section 1: Custodian Information */}
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
              {t('owner.sec1Title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-xs border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10.5px]">{t('owner.applicantBusinessName')}</span>
                <strong className="text-slate-800">{user?.fullName || 'Sovereign Agro Logistics Ltd'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10.5px]">{t('owner.custodianAccountId')}</span>
                <span className="font-mono text-slate-800">{user?.id || 'demo-owner-id'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Instrument Specifications */}
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
              {t('owner.sec2Title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="gov-label">
                  {t('owner.fieldCategory')} <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="gov-select"
                  required
                >
                  <option value="WEIGHING_SCALE">Non-Automatic Weighing Scale (NAWI)</option>
                  <option value="PRESSURE_GAUGE">Pressure Gauge</option>
                  <option value="FUEL_DISPENSER">Fuel Dispenser Unit</option>
                </select>
              </div>

              <div>
                <label className="gov-label">
                  {t('owner.fieldManufacturer')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mettler Toledo Inc."
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="gov-input"
                />
              </div>

              <div>
                <label className="gov-label">
                  {t('owner.fieldModel')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IND570 Industrial Scale"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="gov-input"
                />
              </div>

              <div>
                <label className="gov-label">
                  {t('owner.fieldSerial')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MT-IND-2024-9981"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="gov-input font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {t('owner.serialHelper')}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Metrological Range & Verification Cycle */}
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
              {t('owner.sec3Title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="gov-label">
                  {t('owner.fieldCapacity')} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 150 kg or 10 Bar"
                  value={formData.ratedCapacity}
                  onChange={(e) => setFormData({ ...formData, ratedCapacity: e.target.value })}
                  className="gov-input"
                />
              </div>

              <div>
                <label className="gov-label">
                  {t('owner.fieldInterval')}
                </label>
                <select
                  value={formData.verificationInterval}
                  onChange={(e) => setFormData({ ...formData, verificationInterval: Number(e.target.value) })}
                  className="gov-select"
                >
                  <option value={12}>{t('owner.interval12')}</option>
                  <option value={24}>{t('owner.interval24')}</option>
                  <option value={6}>{t('owner.interval6')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Declaration */}
          <div className="bg-slate-50 p-3 rounded-xs border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <strong className="block text-slate-900 uppercase text-[10.5px] mb-0.5">
              {t('owner.sec4Title')}
            </strong>
            {t('owner.sec4Desc')}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="gov-btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={modalSubmitting}
              className="gov-btn-primary font-bold"
            >
              {modalSubmitting ? t('owner.registering') : t('owner.registerConfirm')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Certificate Full Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-3 sm:p-6 flex justify-center items-start">
          <div className="relative w-full max-w-4xl my-2 sm:my-4">
            <div className="print-hide absolute top-2 right-2 sm:top-3 sm:right-3 z-30">
              <button
                onClick={() => setSelectedCert(null)}
                className="bg-white hover:bg-slate-100 text-slate-800 p-2 rounded-xs shadow-md border border-slate-300 transition"
                title="Close Certificate Preview"
              >
                {t('owner.closePreview')}
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
