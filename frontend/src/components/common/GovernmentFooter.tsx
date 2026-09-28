import React from 'react';
import { Link } from 'react-router-dom';

export const GovernmentFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t-2 border-slate-700 mt-auto text-xs print-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Col 1: System Identity */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white uppercase tracking-wider">
                e-MAANAK
              </span>
              <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.2 border border-slate-700 rounded-xs font-mono">
                SIH26036
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sovereign Legal Metrology Measuring Instrument Verification Architecture.
            </p>
            <p className="text-[10px] text-slate-500">
              Smart India Hackathon 2026 Prototype. System-generated verification records.
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-2 pb-1 border-b border-slate-800">
              Portal Services
            </h3>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <Link to="/verify/demo-qr-token-1" className="hover:text-white transition">
                  Public Certificate Verification
                </Link>
              </li>
              <li>
                <Link to="/owner" className="hover:text-white transition">
                  Commercial Measuring Instruments
                </Link>
              </li>
              <li>
                <Link to="/officer" className="hover:text-white transition">
                  Metrological Inspection Queue
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">
                  Directorate Administration & Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical & Compliance Standards */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-white mb-2 pb-1 border-b border-slate-800">
              Statutory Rules & Integrity
            </h3>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>Rule Standard: NAWI MPE Model (v1.0)</li>
              <li>Tolerance Criteria: Maximum Permissible Error ±0.05%</li>
              <li>Integrity Engine: Cryptographic SHA-256 HMAC Signatures</li>
              <li>Client-side Offline Queue & Sync Ready</li>
            </ul>
          </div>

          {/* Col 4: Prototype Disclaimer */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-2 pb-1 border-b border-slate-800">
              Prototype Notice
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This portal is an engineering prototype designed and implemented for Smart India Hackathon 2026. It is not an officially deployed Government of India website.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              Node ID: sih-2026-node-01 • Version 1.0.0
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-slate-500">
          <div>
            © 2026 e-Maanak Sovereign Verification Prototype • All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300">Accessibility Statement</span>
            <span>•</span>
            <span className="hover:text-slate-300">Privacy Notice</span>
            <span>•</span>
            <span className="hover:text-slate-300">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
