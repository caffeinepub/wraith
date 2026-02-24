import React from 'react';
import { Outlet } from '@tanstack/react-router';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: 'url(/assets/generated/wraith-bg.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-ops-bg/85 pointer-events-none z-0" />

      {/* Navigation */}
      <div className="relative z-10">
        <Navigation />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-ops-border/40 bg-sidebar/80 py-4 px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-ops-muted text-xs font-mono tracking-wider">
            © {new Date().getFullYear()} W.R.A.I.T.H. — WORLDWIDE RECOVERS & ASYMMETRIC INTELLIGENCE THREAT HUB
          </div>
          <div className="text-ops-muted text-xs font-mono">
            Built with{' '}
            <span className="text-red-ops">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'wraith-ops')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-ops hover:text-amber-glow transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
