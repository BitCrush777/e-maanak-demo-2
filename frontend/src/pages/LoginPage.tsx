import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { GovernmentHeader } from '../components/common/GovernmentHeader';
import { GovernmentFooter } from '../components/common/GovernmentFooter';
import { Alert } from '../components/common/Alert';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signInAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error.message || 'Authentication failed. Please verify your credentials.');
      } else {
        if (email.includes('officer')) navigate('/officer');
        else if (email.includes('admin')) navigate('/admin');
        else navigate('/owner');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during portal authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (role: 'OWNER' | 'OFFICER' | 'ADMIN') => {
    signInAsDemo(role);
    if (role === 'OFFICER') navigate('/officer');
    else if (role === 'ADMIN') navigate('/admin');
    else navigate('/owner');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <GovernmentHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Service Portal Context & Evaluator Fast-Track */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-slate-300 pb-4">
              <span className="text-[11px] font-bold text-gov-navy uppercase tracking-wider font-mono">
                {t('common.sihNotice')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-navy mt-1 tracking-tight">
                {t('auth.gatewayTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {t('auth.gatewaySubtitle')}
              </p>
            </div>

            {/* Regulatory Notice & Information */}
            <div className="bg-white border border-slate-300 p-4 rounded-xs shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1.5">
                {t('auth.statutoryOverview')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="border border-slate-200 p-2.5 bg-slate-50/70 rounded-xs">
                  <strong className="block text-slate-900 text-[11px] uppercase mb-1">
                    {t('auth.step1Title')}
                  </strong>
                  <p className="text-slate-600 text-[11px] leading-tight">
                    {t('auth.step1Desc')}
                  </p>
                </div>
                <div className="border border-slate-200 p-2.5 bg-slate-50/70 rounded-xs">
                  <strong className="block text-slate-900 text-[11px] uppercase mb-1">
                    {t('auth.step2Title')}
                  </strong>
                  <p className="text-slate-600 text-[11px] leading-tight">
                    {t('auth.step2Desc')}
                  </p>
                </div>
                <div className="border border-slate-200 p-2.5 bg-slate-50/70 rounded-xs">
                  <strong className="block text-slate-900 text-[11px] uppercase mb-1">
                    {t('auth.step3Title')}
                  </strong>
                  <p className="text-slate-600 text-[11px] leading-tight">
                    {t('auth.step3Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Bar (Clean, Serious Government Evaluator Panel) */}
            <div className="bg-amber-50/60 border border-amber-300 p-4 rounded-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-2.5">
                <div>
                  <h2 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    {t('auth.evaluatorAccessTitle')}
                  </h2>
                  <p className="text-[11px] text-amber-800">
                    {t('auth.evaluatorAccessDesc')}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-xs border border-amber-300">
                  {t('common.evaluatorMode')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('OWNER')}
                  className="p-2.5 bg-white border border-amber-300 hover:border-amber-500 rounded-xs text-left shadow-xs transition"
                >
                  <div className="font-bold text-slate-900">{t('auth.custodianTitle')}</div>
                  <div className="text-[11px] text-slate-500">{t('auth.custodianSubtitle')}</div>
                  <div className="text-[10px] text-gov-navy font-semibold mt-1">{t('auth.signInAsOwner')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('OFFICER')}
                  className="p-2.5 bg-white border border-amber-300 hover:border-amber-500 rounded-xs text-left shadow-xs transition"
                >
                  <div className="font-bold text-slate-900">{t('auth.officerTitle')}</div>
                  <div className="text-[11px] text-slate-500">{t('auth.officerSubtitle')}</div>
                  <div className="text-[10px] text-gov-navy font-semibold mt-1">{t('auth.signInAsOfficer')}</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="p-2.5 bg-white border border-amber-300 hover:border-amber-500 rounded-xs text-left shadow-xs transition"
                >
                  <div className="font-bold text-slate-900">{t('auth.adminTitle')}</div>
                  <div className="text-[11px] text-slate-500">{t('auth.adminSubtitle')}</div>
                  <div className="text-[10px] text-gov-navy font-semibold mt-1">{t('auth.signInAsAdmin')}</div>
                </button>
              </div>
            </div>

            {/* Public Certificate Quick Verification Link */}
            <div className="border border-slate-300 bg-white p-3.5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">
                  {t('auth.publicLookupTitle')}
                </span>
                <span className="text-slate-600 text-[11px]">
                  {t('auth.publicLookupDesc')}
                </span>
              </div>
              <Link
                to="/verify/demo-qr-token-1"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xs font-semibold text-center whitespace-nowrap"
              >
                {t('auth.openPublicVerify')}
              </Link>
            </div>
          </div>

          {/* Right Column: Secure Portal Login Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-slate-300 p-6 rounded-xs shadow-xs">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-base font-bold text-gov-navy uppercase tracking-wide">
                  {t('auth.loginCardTitle')}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('auth.loginCardSubtitle')}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4">
                  <Alert type="error" title={t('auth.authErrorTitle')}>
                    {errorMsg}
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="gov-label">
                    {t('auth.emailLabel')} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="gov-input"
                    autoComplete="username"
                  />
                  <span className="text-[10.5px] text-slate-400 mt-1 block">
                    {t('auth.emailHelper')}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-password" className="gov-label mb-0">
                      {t('auth.passwordLabel')} <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-gov-navy hover:underline"
                    >
                      {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="gov-input"
                    autoComplete="current-password"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gov-btn-primary py-2 text-xs uppercase tracking-wider font-bold"
                  >
                    {isSubmitting ? t('auth.signingIn') : t('auth.signInButton')}
                  </button>
                </div>

                <div className="text-center pt-2 border-t border-slate-200">
                  <p className="text-[11px] text-slate-500">
                    {t('auth.needSupport')}
                  </p>
                </div>
              </form>
            </div>

            <div className="mt-3 text-[10px] text-slate-500 text-center">
              {t('auth.prototypeTagline')}
            </div>
          </div>
        </div>
      </main>

      <GovernmentFooter />
    </div>
  );
};
