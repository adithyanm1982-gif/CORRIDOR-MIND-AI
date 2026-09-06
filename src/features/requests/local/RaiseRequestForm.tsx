import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLocalRequestStore } from './localRequestStore';
import { Button } from '@/shared/components/ui/Button';
import { Urgency } from '@/shared/types/railsyncReal';

const ASSET_TYPES_BY_DEPT: Record<string, string[]> = {
  Engineering: ['Track', 'Sleeper', 'Bridge', 'Rail'],
  'S&T': ['Signal', 'Point Machine', 'Interlocking', 'Axle Counter', 'Telecom'],
  Traction: ['OHE', 'Catenary', 'Traction Mast', 'Pantograph Interface', 'Isolator'],
};

const MAINTENANCE_TYPES_BY_DEPT: Record<string, string[]> = {
  Engineering: ['Track Inspection', 'Rail Renewal', 'Sleeper Replacement', 'Bridge Structural Check'],
  'S&T': ['Signal Calibration', 'Interlocking Test', 'Point Machine Lubrication', 'Axle Counter Reset'],
  Traction: ['OHE Tension Check', 'Catenary Dropper Replacement', 'Isolator Servicing', 'Mast Inspection'],
};

const CORRIDORS = ['C01', 'C02', 'C03', 'C04'];
const URGENCIES: Urgency[] = ['IMMEDIATE', 'HIGH', 'MEDIUM', 'NORMAL', 'LOW'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Raise-request form for Engineering/S&T/Traction logins. Department
 * is fixed by the logged-in user's role, not selectable. Submits into
 * the local request queue (localRequestStore) -- the real backend has
 * no create endpoint, so this is fully client-side, and immediately
 * visible to the Controller's Requests and Approvals tabs since they
 * read from the same store.
 */
export function RaiseRequestForm() {
  const { user } = useAuth();
  const department = user?.department;
  const raiseRequest = useLocalRequestStore((s) => s.raiseRequest);

  const assetTypes = department ? ASSET_TYPES_BY_DEPT[department] : [];
  const maintenanceTypes = department ? MAINTENANCE_TYPES_BY_DEPT[department] : [];

  const [assetType, setAssetType] = useState(assetTypes[0] ?? '');
  const [maintenanceType, setMaintenanceType] = useState(maintenanceTypes[0] ?? '');
  const [issue, setIssue] = useState('');
  const [corridorId, setCorridorId] = useState(CORRIDORS[0]);
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [urgency, setUrgency] = useState<Urgency>('MEDIUM');
  const [preferredDay, setPreferredDay] = useState(DAYS[0]);
  const [submitted, setSubmitted] = useState(false);

  if (!department) {
    return <p className="text-sm text-slate-500">Only department logins can raise requests.</p>;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (durationMinutes <= 0) return;
    raiseRequest({
      department: department!,
      asset_type: assetType,
      maintenance_type: maintenanceType,
      issue: issue || `Routine ${maintenanceType.toLowerCase()}`,
      corridor_id: corridorId,
      estimated_duration_hours: durationMinutes / 60,
      urgency,
      preferred_day: preferredDay,
    });
    setSubmitted(true);
    setIssue('');
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Asset Type</label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
          >
            {assetTypes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Maintenance Type</label>
          <select
            value={maintenanceType}
            onChange={(e) => setMaintenanceType(e.target.value)}
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
          >
            {maintenanceTypes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 space-y-1">
          <label className="text-xs text-slate-400">Issue Description</label>
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            rows={2}
            placeholder="Briefly describe the issue..."
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Corridor</label>
          <select
            value={corridorId}
            onChange={(e) => setCorridorId(e.target.value)}
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
          >
            {CORRIDORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Estimated Duration (minutes)</label>
          <input
            type="number"
            min={5}
            max={1440}
            step={5}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Math.max(0, Number(e.target.value)))}
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Urgency</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
          >
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Preferred Day</label>
          <select
            value={preferredDay}
            onChange={(e) => setPreferredDay(e.target.value)}
            className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">Raise Request</Button>
        {submitted && <span className="text-xs text-signal-green">Request submitted to the Section Controller.</span>}
      </div>
    </form>
  );
}
