import React from 'react';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import MissionDashboard from './pages/MissionDashboard';
import IntelligenceHub from './pages/IntelligenceHub';
import FieldOpsBriefing from './pages/FieldOpsBriefing';
import AdminPanel from './pages/AdminPanel';
import { Shield, LogIn, Loader2 } from 'lucide-react';

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen() {
  const { login, loginStatus, isInitializing } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ops-bg relative overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/generated/wraith-bg.dim_1920x1080.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-ops-bg/88 pointer-events-none" />

      {/* Top classification strip */}
      <div className="absolute top-0 left-0 right-0 bg-red-ops/90 text-foreground text-center py-1 text-xs font-display font-bold tracking-widest z-10">
        ⬛ CLASSIFIED // TOP SECRET // WRAITH EYES ONLY ⬛
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src="/assets/generated/wraith-logo.dim_256x256.png"
              alt="WRAITH"
              className="w-24 h-24 object-contain opacity-90"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <Shield className="w-24 h-24 text-amber-ops absolute inset-0 opacity-0" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-black text-amber-ops text-4xl tracking-widest text-glow-amber flicker">
              W.R.A.I.T.H.
            </h1>
            <p className="text-ops-muted text-xs font-mono tracking-widest mt-1">
              WORLDWIDE RECOVERS & ASYMMETRIC INTELLIGENCE THREAT HUB
            </p>
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full ops-card p-6 space-y-6">
          <div className="border-b border-ops-border/40 pb-4">
            <div className="text-amber-ops text-xs font-mono tracking-widest mb-1">SECURE ACCESS TERMINAL</div>
            <div className="text-ops-muted text-xs font-mono">
              AUTHENTICATION REQUIRED — TITLE 50 AUTHORITY
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono text-ops-muted">
            <div className="flex items-center gap-2">
              <span className="text-amber-ops">▸</span>
              <span>IDENTITY VERIFICATION REQUIRED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-ops">▸</span>
              <span>UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-ops">▸</span>
              <span>ALL SESSIONS ARE MONITORED AND LOGGED</span>
            </div>
          </div>

          <button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-ops/20 border border-amber-ops/50 text-amber-ops hover:bg-amber-ops/30 hover:border-amber-ops font-mono font-bold tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn || isInitializing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> AUTHENTICATING...</>
            ) : (
              <><LogIn className="w-4 h-4" /> AUTHENTICATE IDENTITY</>
            )}
          </button>
        </div>

        <div className="text-ops-muted text-xs font-mono text-center">
          © {new Date().getFullYear()} W.R.A.I.T.H. — CLASSIFIED OPERATIONS PLATFORM
        </div>
      </div>

      {/* Bottom classification strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-red-ops/90 text-foreground text-center py-1 text-xs font-display font-bold tracking-widest z-10">
        ⬛ CLASSIFIED // TOP SECRET // WRAITH EYES ONLY ⬛
      </div>
    </div>
  );
}

// ─── App Shell (authenticated) ────────────────────────────────────────────────

function AppShell() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ops-bg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-ops animate-spin" />
          <div className="text-amber-ops text-xs font-mono tracking-widest animate-pulse">
            INITIALIZING SECURE CONNECTION...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <>
      <Outlet />
      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: AppShell,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/missions' });
  },
  component: () => null,
});

const missionsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/missions',
  component: MissionDashboard,
});

const intelligenceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/intelligence',
  component: IntelligenceHub,
});

const briefingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/briefings',
  component: FieldOpsBriefing,
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminPanel,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    missionsRoute,
    intelligenceRoute,
    briefingsRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
