import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { setAppLanguage } from '../../i18n';

export const GovernmentHeader: React.FC = () => {
  const { user, signOut, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const handleFontScale = (scale: 'sm' | 'md' | 'lg') => {
    setFontScale(scale);
    document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg');
    document.documentElement.classList.add(`font-scale-${scale}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const currentLang = i18n.language === 'hi' ? 'hi' : 'en';

  return (
    <header className="bg-white border-b border-slate-300 shadow-xs print-hide">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-slate-100 border-b border-slate-300 text-[11px] text-slate-700 py-1 px-4 sm:px-6 lg:px-8">
        <a href="#main-content" className="skip-to-content">
          {t('common.skipToContent')}
        </a>

        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: System Utility Title */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 tracking-wide font-mono text-[10px]">
              {t('common.utilityTitle')}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 hidden sm:inline">
              {t('common.utilitySubtitle')}
            </span>
          </div>

          {/* Right: Accessibility & Language Controls */}
          <div className="flex items-center space-x-3 text-[11px]">
            {/* Font Resize */}
            <div className="flex items-center space-x-1 border-r border-slate-300 pr-3">
              <span className="text-slate-500 font-semibold mr-1">{t('common.textSize')}:</span>
              <button
                type="button"
                onClick={() => handleFontScale('sm')}
                className={`px-1.5 py-0.5 border rounded-xs text-[10px] ${
                  fontScale === 'sm' ? 'bg-gov-navy text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => handleFontScale('md')}
                className={`px-1.5 py-0.5 border rounded-xs text-[10px] ${
                  fontScale === 'md' ? 'bg-gov-navy text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="Standard font size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleFontScale('lg')}
                className={`px-1.5 py-0.5 border rounded-xs text-[10px] ${
                  fontScale === 'lg' ? 'bg-gov-navy text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Contrast Mode Toggle */}
            <div className="flex items-center space-x-1 border-r border-slate-300 pr-3">
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`px-1.5 py-0.5 border rounded-xs text-[10px] font-semibold ${
                  highContrast ? 'bg-black text-white border-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
                title="Toggle High Contrast"
              >
                {highContrast ? t('common.contrastNormal') : t('common.contrastHigh')}
              </button>
            </div>

            {/* Language Switcher (English | हिन्दी) */}
            <div className="flex items-center space-x-1" aria-label="Language selection">
              <span className="text-slate-500 font-semibold mr-1">{t('common.language')}:</span>
              <button
                type="button"
                onClick={() => setAppLanguage('en')}
                className={`px-1.5 py-0.5 border rounded-xs text-[10px] font-semibold transition ${
                  currentLang === 'en'
                    ? 'bg-gov-navy text-white border-gov-navy'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title="Switch interface language to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setAppLanguage('hi')}
                className={`px-1.5 py-0.5 border rounded-xs text-[10px] font-semibold transition ${
                  currentLang === 'hi'
                    ? 'bg-gov-navy text-white border-gov-navy'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title="इंटरफ़ेस भाषा हिन्दी में बदलें"
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR (e-Maanak Regulatory Branding) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left Brand Identity */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            {/* Metrological Geometric Crest */}
            <div className="w-11 h-11 bg-gov-navy border-2 border-slate-800 rounded-xs flex items-center justify-center p-1.5 flex-shrink-0 text-white shadow-xs">
              <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
                <path d="M24 6V42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M12 14H36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <path d="M8 18L12 14L16 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M32 18L36 14L40 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M6 26C6 29.3 8.7 32 12 32C15.3 32 18 29.3 18 26H6Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
                <path d="M30 26C30 29.3 32.7 32 36 32C39.3 32 42 29.3 42 26H30Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
                <path d="M16 42H32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            <div>
              <span className="font-extrabold text-xl sm:text-2xl text-gov-navy tracking-tight uppercase block leading-tight">
                {t('common.systemTitle')}
              </span>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-wide">
                {t('common.systemSubtitle')}
              </p>
            </div>
          </Link>

          {/* Right: Role Switcher & User Account Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Role Options (Owner, Officer, Admin) */}
            <div className="hidden lg:flex items-center bg-slate-50 border border-slate-300 p-0.5 rounded-xs text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 px-1.5">
                {t('common.roleSelector')}:
              </span>
              <button
                type="button"
                onClick={() => {
                  signInAsDemo('OWNER');
                  navigate('/owner');
                }}
                className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold transition ${
                  user?.role === 'OWNER'
                    ? 'bg-gov-navy text-white'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                title="Switch to Owner Portal"
              >
                {t('common.ownerRole')}
              </button>
              <button
                type="button"
                onClick={() => {
                  signInAsDemo('OFFICER');
                  navigate('/officer');
                }}
                className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold transition ${
                  user?.role === 'OFFICER'
                    ? 'bg-gov-navy text-white'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                title="Switch to Officer Portal"
              >
                {t('common.officerRole')}
              </button>
              <button
                type="button"
                onClick={() => {
                  signInAsDemo('ADMIN');
                  navigate('/admin');
                }}
                className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold transition ${
                  user?.role === 'ADMIN'
                    ? 'bg-gov-navy text-white'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                title="Switch to Admin Portal"
              >
                {t('common.adminRole')}
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 text-xs">
                <div className="text-right hidden sm:block border-l border-slate-300 pl-3">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {user.fullName || user.email}
                  </div>
                  <div className="flex items-center justify-end space-x-1 text-[10.5px] text-slate-500">
                    <span className="font-bold text-gov-navy uppercase tracking-wider">
                      [{user.role}]
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xs text-xs font-medium transition"
                >
                  {t('common.signOut')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 bg-gov-navy hover:bg-gov-hover text-white text-xs font-semibold rounded-xs shadow-xs transition"
                >
                  {t('common.signIn')}
                </Link>
                <Link
                  to="/verify"
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xs text-xs font-semibold transition hidden sm:inline-block"
                >
                  {t('common.verifyCert')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 border border-slate-300 rounded-xs text-slate-700 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY NAVIGATION BAR (Horizontal Portal Bar) */}
      <nav
        aria-label="Primary Portal Navigation"
        className="bg-gov-navy text-white border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center space-x-0.5 text-xs font-semibold uppercase tracking-wider">
            {/* Owner Navigation */}
            {user?.role === 'OWNER' && (
              <Link
                to="/owner"
                className={`px-4 py-2.5 border-b-2 transition ${
                  isActive('/owner')
                    ? 'bg-gov-hover border-amber-400 text-white'
                    : 'border-transparent text-slate-200 hover:bg-gov-hover hover:text-white'
                }`}
              >
                {t('nav.ownerTab')}
              </Link>
            )}

            {/* Officer Navigation */}
            {user?.role === 'OFFICER' && (
              <Link
                to="/officer"
                className={`px-4 py-2.5 border-b-2 transition ${
                  isActive('/officer')
                    ? 'bg-gov-hover border-amber-400 text-white'
                    : 'border-transparent text-slate-200 hover:bg-gov-hover hover:text-white'
                }`}
              >
                {t('nav.officerTab')}
              </Link>
            )}

            {/* Admin Navigation */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-4 py-2.5 border-b-2 transition ${
                  isActive('/admin')
                    ? 'bg-gov-hover border-amber-400 text-white'
                    : 'border-transparent text-slate-200 hover:bg-gov-hover hover:text-white'
                }`}
              >
                {t('nav.adminTab')}
              </Link>
            )}

            {/* Public / Common Verification Link */}
            <Link
              to="/verify"
              className={`px-4 py-2.5 border-b-2 transition ${
                location.pathname.startsWith('/verify')
                  ? 'bg-gov-hover border-amber-400 text-white'
                  : 'border-transparent text-slate-200 hover:bg-gov-hover hover:text-white'
              }`}
            >
              {t('nav.verifyTab')}
            </Link>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 space-y-1 border-t border-slate-700 text-xs">
              {user?.role === 'OWNER' && (
                <Link
                  to="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded text-slate-200 hover:bg-gov-hover"
                >
                  {t('nav.ownerTab')}
                </Link>
              )}

              {user?.role === 'OFFICER' && (
                <Link
                  to="/officer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded text-slate-200 hover:bg-gov-hover"
                >
                  {t('nav.officerTab')}
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded text-slate-200 hover:bg-gov-hover"
                >
                  {t('nav.adminTab')}
                </Link>
              )}

              <Link
                to="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded text-slate-200 hover:bg-gov-hover"
              >
                {t('nav.verifyTab')}
              </Link>

              <div className="pt-2 mt-2 border-t border-slate-700 px-3 pb-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  {t('common.roleSelector')}:
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      signInAsDemo('OWNER');
                      setMobileMenuOpen(false);
                      navigate('/owner');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs text-[11px] font-semibold"
                  >
                    {t('common.ownerRole')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      signInAsDemo('OFFICER');
                      setMobileMenuOpen(false);
                      navigate('/officer');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs text-[11px] font-semibold"
                  >
                    {t('common.officerRole')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      signInAsDemo('ADMIN');
                      setMobileMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xs text-[11px] font-semibold"
                  >
                    {t('common.adminRole')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
