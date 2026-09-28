import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { user, signOut, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Tricolor Government Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white via-50% to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Portal Branding */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-sovereign-navy text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-sovereign-brass">
                मान
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-sovereign-navy tracking-tight group-hover:text-blue-900">
                    e-MAANAK
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                    SIH 2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Sovereign Legal Metrology Verification
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {user.role === 'OWNER' && (
                <>
                  <Link
                    to="/owner"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/owner')
                        ? 'bg-blue-50 text-sovereign-navy font-semibold'
                        : 'text-slate-600 hover:text-sovereign-navy hover:bg-slate-50'
                    }`}
                  >
                    My Instruments & Applications
                  </Link>
                </>
              )}

              {user.role === 'OFFICER' && (
                <>
                  <Link
                    to="/officer"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/officer')
                        ? 'bg-blue-50 text-sovereign-navy font-semibold'
                        : 'text-slate-600 hover:text-sovereign-navy hover:bg-slate-50'
                    }`}
                  >
                    Field Inspection Queue
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-blue-50 text-sovereign-navy font-semibold'
                        : 'text-slate-600 hover:text-sovereign-navy hover:bg-slate-50'
                    }`}
                  >
                    Directorate Admin Panel
                  </Link>
                </>
              )}

              <Link
                to="/verify/demo-qr-token-1"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/verify')
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                🔍 QR Verification Portal
              </Link>
            </nav>
          )}

          {/* User Profile & Demo Switcher */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Fast Role Switcher Dropdown (for SIH Evaluator convenience) */}
                <div className="hidden lg:flex items-center text-xs bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <span className="text-slate-500 px-1 font-semibold">Switch Role:</span>
                  <button
                    onClick={() => {
                      signInAsDemo('OWNER');
                      navigate('/owner');
                    }}
                    className={`px-2 py-0.5 rounded transition ${
                      user.role === 'OWNER' ? 'bg-white shadow text-amber-700 font-bold' : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    Owner
                  </button>
                  <button
                    onClick={() => {
                      signInAsDemo('OFFICER');
                      navigate('/officer');
                    }}
                    className={`px-2 py-0.5 rounded transition ${
                      user.role === 'OFFICER' ? 'bg-white shadow text-blue-700 font-bold' : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    Officer
                  </button>
                  <button
                    onClick={() => {
                      signInAsDemo('ADMIN');
                      navigate('/admin');
                    }}
                    className={`px-2 py-0.5 rounded transition ${
                      user.role === 'ADMIN' ? 'bg-white shadow text-emerald-700 font-bold' : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.fullName}
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        user.role === 'OWNER'
                          ? 'bg-amber-100 text-amber-800'
                          : user.role === 'OFFICER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-[11px] text-slate-400">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-sovereign-navy text-white text-sm font-semibold rounded-md hover:bg-blue-900 shadow-sm transition"
                >
                  Login to Portal
                </Link>
                <Link
                  to="/verify/demo-qr-token-1"
                  className="px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition"
                >
                  Verify Certificate
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
