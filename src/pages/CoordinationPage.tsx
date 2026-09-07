// src/pages/CoordinationPage.tsx
import { useMemo, useState } from 'react';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import { ScheduleTable } from '@/features/schedules/components/ScheduleTable';
import { PlanningDateSelector } from '@/shared/components/ui/PlanningDateSelector';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { RealScheduleEntry } from '@/shared/types/railsyncReal';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: '#38BDF8',
  'S&T': '#F43F5E',
  Traction: '#F59E0B',
};

/**
 * "Coordination" tab per backend spec: opportunities where multiple
 * maintenance requests can be combined into the same block/window.
 *
 * NOTE: the openapi.json export doesn't list a dedicated /api/coordination
 * endpoint -- coordination_engine.py's joint-block output is presumably
 * embedded inside the schedules/optimization response instead. Until
 * that's confirmed, this page derives real joint-block opportunities
 * client-side from the same live GET /api/schedules/ feed used in the
 * panel above (same subsection_id + overlapping [date,start_time,end_time]
 * windows + different departments) -- this is real detection logic
 * against real data, not a mock.
 *
 * Previously sourced this from a static simulation-folder dataset
 * (REAL_SCHEDULE_ENTRIES); that folder no longer exists after the
 * simulation rework, so this now runs against the live `query` result
 * from useSchedules instead -- one real data source for the whole page.
 */

interface JointGroup {
  subsectionId: string;
  date: string;
  entries: RealScheduleEntry[];
}

function windowsOverlap(a: RealScheduleEntry, b: RealScheduleEntry): boolean {
  if (a.date !== b.date) return false;
  return a.start_time < b.end_time && b.start_time < a.end_time;
}

function findJointGroups(entries: RealScheduleEntry[]): JointGroup[] {
  const bySubsection = new Map<string, RealScheduleEntry[]>();
  for (const e of entries) {
    const list = bySubsection.get(e.subsection_id) ?? [];
    list.push(e);
    bySubsection.set(e.subsection_id, list);
  }

  const groups: JointGroup[] = [];
  for (const [subsectionId, list] of bySubsection) {
    const used = new Set<string>();
    for (let i = 0; i < list.length; i++) {
      if (used.has(list[i].request_id)) continue;
      const cluster = [list[i]];
      for (let j = i + 1; j < list.length; j++) {
        if (used.has(list[j].request_id)) continue;
        if (windowsOverlap(list[i], list[j]) && list[j].department !== list[i].department) {
          cluster.push(list[j]);
          used.add(list[j].request_id);
        }
      }
      if (cluster.length > 1) {
        used.add(list[i].request_id);
        groups.push({ subsectionId, date: list[i].date, entries: cluster });
      }
    }
  }
  return groups;
}

export function CoordinationPage() {
  const [planningDate, setPlanningDate] = useState('2026-08-25');
  const [corridorId, setCorridorId] = useState('');

  const query = useSchedules({ planning_date: planningDate, corridor_id: corridorId || undefined });
  const jointGroups = useMemo(() => findJointGroups(query.data?.schedules ?? []), [query.data]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Live Schedule Feed (source for joint-block detection)</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <PlanningDateSelector
            planningDate={planningDate}
            corridorId={corridorId}
            onPlanningDateChange={setPlanningDate}
            onCorridorIdChange={setCorridorId}
            onRefresh={() => query.refetch()}
            isFetching={query.isFetching}
          />

          {query.isLoading && (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <RefreshCw size={14} className="animate-spin" />
              Fetching live data — the backend may be cold-starting (can take up to ~90s)...
            </div>
          )}

          {query.isError && (
            <div className="flex items-start gap-2 rounded-lg border border-dept-snt/40 bg-dept-snt/10 p-3 text-sm text-dept-snt">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>{(query.error as Error)?.message ?? 'Could not reach the backend.'}</p>
            </div>
          )}

          {query.data && (
            <>
              <div
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                  query.data.safety_valid
                    ? 'border-signal-green/40 bg-signal-green/10 text-signal-green'
                    : 'border-dept-snt/40 bg-dept-snt/10 text-dept-snt'
                }`}
              >
                {query.data.safety_valid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>
                  {query.data.count} schedules · {query.data.planning_date} · Corridor {query.data.corridor_id} ·{' '}
                  {query.data.safety_valid ? 'Safety valid' : 'Safety issues detected'}
                </span>
              </div>
              <ScheduleTable schedules={query.data.schedules} />
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Joint Block Opportunities ({jointGroups.length})</CardTitle>
        </CardHeader>
        <p className="text-xs text-slate-500 mb-3">
          Detected from the live schedule feed above: same block (subsection), overlapping time windows, different
          departments. This is real analysis of real data — not a mock — but should be cross-checked against the
          backend's own coordination_engine.py output once that's exposed via an API endpoint.
        </p>
        {query.isLoading ? (
          <p className="text-sm text-slate-500 py-6 text-center">Loading joint-block analysis...</p>
        ) : jointGroups.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No overlapping cross-department windows found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {jointGroups.map((group) => (
              <div key={`${group.subsectionId}-${group.date}-${group.entries[0].request_id}`} className="space-y-2">
                <p className="text-xs text-slate-400">
                  Block {group.subsectionId} · {group.date} · {group.entries.length} departments
                </p>
                {group.entries.map((entry) => (
                  <div key={entry.request_id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <div className="flex items-center justify-between">
                      <Badge color={DEPARTMENT_COLORS[entry.department]}>{entry.department}</Badge>
                      <span className="text-xs text-slate-500">
                        {entry.start_time} → {entry.end_time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5">{entry.maintenance_type}</p>
                    <p className="text-[10px] text-slate-500">
                      {entry.from_station} → {entry.to_station}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}