import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const GovernmentFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t-2 border-slate-700 mt-auto text-xs print-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Col 1: System Identity */}
          <div className="space-y-2 md:col-span-1">
            <span className="font-extrabold text-sm text-white uppercase tracking-wider block">
              {t('common.systemTitle')}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('common.systemSubtitle')}
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-2 pb-1 border-b border-slate-800">
              {t('common.footerServices')}
            </h3>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <Link to="/verify" className="hover:text-white transition">
                  {t('nav.verifyTab')}
                </Link>
              </li>
              <li>
                <Link to="/owner" className="hover:text-white transition">
                  {t('nav.ownerTab')}
                </Link>
              </li>
              <li>
                <Link to="/officer" className="hover:text-white transition">
                  {t('nav.officerTab')}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">
                  {t('nav.adminTab')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical & Compliance Standards */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-2 pb-1 border-b border-slate-800">
              {t('common.footerCompliance')}
            </h3>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>Rule Standard: NAWI MPE Model (v1.0)</li>
              <li>Tolerance Criteria: Maximum Permissible Error ±0.05%</li>
              <li>Integrity Engine: Cryptographic SHA-256 HMAC Signatures</li>
              <li>Client-side Offline Queue & Sync Ready</li>
            </ul>
          </div>

          {/* Col 4: System Information */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-2 pb-1 border-b border-slate-800">
              {t('common.footerDisclaimer')}
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('common.footerDisclaimerText')}
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              System Node: em-node-01 • Version 1.0.0
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-slate-500">
          <div>
            {t('common.footerRights')}
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 cursor-pointer">{t('common.footerAccessibility')}</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">{t('common.footerPrivacy')}</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">{t('common.footerTerms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
