import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { GovernmentHeader } from '../components/common/GovernmentHeader';
import { GovernmentFooter } from '../components/common/GovernmentFooter';
import { Alert } from '../components/common/Alert';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(error.message || 'Authentication failed. Please verify credentials.');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error encountered during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <GovernmentHeader />

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Service Portal Context */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-slate-300 pb-4">
              <span className="text-[11px] font-bold text-gov-navy uppercase tracking-wider font-mono">
                {t('auth.serviceCategory')}
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
                to="/verify"
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
              {t('auth.systemTagline')}
            </div>
          </div>
        </div>
      </main>

      <GovernmentFooter />
    </div>
  );
};
