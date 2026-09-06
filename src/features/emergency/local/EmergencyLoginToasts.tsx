import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEmergencyStore, EmergencyRequest } from './emergencyStore';

const AUTO_DISMISS_MS = 6000;

/**
 * Fires once per Controller login: snapshots whatever emergencies are
 * currently PENDING at that moment and shows each as a dismissible
 * popup, auto-disappearing after AUTO_DISMISS_MS. Does not re-fire on
 * every emergency update -- that live count still lives on the
 * NotificationBell badge; this is just the one-time "here's what's
 * waiting for you" greeting on login.
 */
export function EmergencyLoginToasts() {
  const { user } = useAuth();
  const emergencies = useEmergencyStore((s) => s.emergencies);
  const [toasts, setToasts] = useState<EmergencyRequest[]>([]);
  const hasFiredRef = useRef(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  // Reset the "already shown" flag whenever the logged-in user changes,
  // so a fresh login can trigger the popups again.
  useEffect(() => {
    if (user?.id !== lastUserIdRef.current) {
      hasFiredRef.current = false;
      lastUserIdRef.current = user?.id;
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role !== 'CONTROLLER' || hasFiredRef.current) return;
    const pending = emergencies.filter((e) => e.status === 'PENDING');
    if (pending.length === 0) return;
    hasFiredRef.current = true;
    setToasts(pending);
  }, [user, emergencies]);

  function dismiss(id: string) {
    setToasts((t) => t.filter((e) => e.id !== id));
  }

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((e) => (
        <div
          key={e.id}
          className="rounded-lg border border-dept-snt/40 bg-dept-snt/10 p-3 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-dept-snt shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-100">
                  {e.department} · {e.severity} emergency
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{e.reason}</p>
              </div>
            </div>
            <button onClick={() => dismiss(e.id)} className="text-slate-500 hover:text-slate-300 shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}