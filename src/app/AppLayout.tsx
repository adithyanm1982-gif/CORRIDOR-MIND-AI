import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/shared/layout/Navbar';
import { EmergencyLoginToasts } from '@/features/emergency/local/EmergencyLoginToasts';

export function AppLayout() {
  const location = useLocation();
  const isFullScreen = location.pathname === '/simulation';

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <Navbar />
      <EmergencyLoginToasts />
      <main className={isFullScreen ? 'flex-1 overflow-hidden' : 'flex-1 overflow-auto p-4'}>
        <Outlet />
      </main>
    </div>
  );
}