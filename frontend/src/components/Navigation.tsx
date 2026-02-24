import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Shield, Target, FileText, Radio, LogOut, LogIn, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/missions', label: 'MISSION OPS', icon: Target },
  { path: '/intelligence', label: 'INTEL HUB', icon: Radio },
  { path: '/briefings', label: 'FIELD BRIEFINGS', icon: FileText },
];

export default function Navigation() {
  const location = useLocation();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <>
      {/* Top classification strip */}
      <div className="bg-red-ops/90 text-foreground text-center py-0.5 text-xs font-display font-bold tracking-widest z-50 relative">
        ⬛ CLASSIFIED // TOP SECRET // WRAITH EYES ONLY ⬛
      </div>

      {/* Main nav */}
      <nav className="bg-sidebar border-b border-ops-border/40 z-40 relative">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex-shrink-0">
              <img
                src="/assets/generated/wraith-logo.dim_256x256.png"
                alt="WRAITH"
                className="w-9 h-9 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Shield className="w-9 h-9 text-amber-ops absolute inset-0 opacity-0 group-hover:opacity-0" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-amber-ops text-lg tracking-widest text-glow-amber flicker">
                W.R.A.I.T.H.
              </div>
              <div className="text-ops-muted text-xs font-mono tracking-wider -mt-1">
                WORLDWIDE RECOVERS & ASYMMETRIC INTELLIGENCE
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold tracking-widest transition-all duration-200 border-b-2 ${
                    isActive
                      ? 'text-amber-ops border-amber-ops text-glow-amber'
                      : 'text-ops-muted border-transparent hover:text-amber-ops/70 hover:border-amber-ops/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User info + auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:block text-right">
                <div className="text-amber-ops text-xs font-mono font-bold tracking-wider">
                  {userProfile.callsign || userProfile.name}
                </div>
                <div className="text-ops-muted text-xs font-mono">
                  {userProfile.department || 'WRAITH UNIT'}
                </div>
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-widest border transition-all duration-200 rounded-none ${
                isAuthenticated
                  ? 'border-ops-border text-ops-muted hover:border-red-ops/50 hover:text-red-ops'
                  : 'border-amber-ops/50 text-amber-ops hover:border-amber-ops hover:glow-amber'
              } disabled:opacity-50`}
            >
              {isLoggingIn ? (
                <span className="animate-pulse">AUTHENTICATING...</span>
              ) : isAuthenticated ? (
                <><LogOut className="w-3 h-3" /> LOGOUT</>
              ) : (
                <><LogIn className="w-3 h-3" /> LOGIN</>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-ops-muted hover:text-amber-ops p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-ops-border/40 bg-sidebar">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-mono font-bold tracking-widest border-l-2 transition-all ${
                    isActive
                      ? 'text-amber-ops border-amber-ops bg-amber-ops/5'
                      : 'text-ops-muted border-transparent hover:text-amber-ops/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
