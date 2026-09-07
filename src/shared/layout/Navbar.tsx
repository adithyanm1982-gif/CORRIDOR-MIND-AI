// src/shared/layout/Navbar.tsx

import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth/types';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';

interface NavItem {
  to: string;
  label: string;
  /** Omit to show for every role. */
  hideForRoles?: UserRole[];
  /** If set, ONLY these roles see this item (overrides hideForRoles logic). */
  onlyForRoles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/requests', label: 'Requests' },
  { to: '/priorities', label: 'Priorities' },
  { to: '/planning', label: 'Planning' },
  // Only Engineering / S&T / Traction departments see Schedules -- the
  // Controller does not.
  { to: '/schedules', label: 'Schedules', onlyForRoles: ['Engineering', 'S&T', 'Traction'] },
  { to: '/conflicts-safety', label: 'Conflicts & Safety' },
  // Only the Section Controller sees Coordination.
  { to: '/coordination', label: 'Coordination', onlyForRoles: ['CONTROLLER'] },
  // Only the Section Controller approves/rejects requests -- Engineering/
  // TRD/S&T raise requests and emergencies, they never approve anything
  // (not even their own).
  { to: '/approvals', label: 'Approvals', onlyForRoles: ['CONTROLLER'] },
  // Only Engineering/TRD/S&T raise emergency escalations -- the Controller
  // has nothing to request; they only ever approve/reject.
  { to: '/emergency', label: 'Emergency', hideForRoles: ['CONTROLLER'] },
  { to: '/data-assets', label: 'Data / Assets' },
  { to: '/simulation', label: 'Simulation' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => {
    const role = user?.role as UserRole;
    if (item.onlyForRoles) return item.onlyForRoles.includes(role);
    return !item.hideForRoles?.includes(role);
  });

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-canvas-panel px-4 py-2.5">
      <div className="flex items-center gap-6">
        <span className="text-sm font-bold tracking-wide text-slate-100">
          CORRIDOR<span className="text-dept-engineering"> MIND AI</span>
        </span>
        <div className="flex gap-1 flex-wrap">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive ? 'bg-slate-800 text-dept-engineering' : 'text-slate-400 hover:text-slate-200'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {user.role === 'CONTROLLER' && <NotificationBell />}
          <ThemeToggle />
          <span>
            {user.name} · <span className="text-slate-300">{user.role}</span>
          </span>
          <button onClick={logout} className="hover:text-dept-snt">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}