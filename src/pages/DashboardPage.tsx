// src/pages/DashboardPage.tsx
import { useState } from 'react';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { useTrains } from '@/features/trains/hooks/useTrains';
import { TrainScheduleTable } from '@/features/trains/components/TrainScheduleTable';
import { PlanningDateSelector } from '@/shared/components/ui/PlanningDateSelector';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { RefreshCw, AlertTriangle, CheckCircle2, TrainFront } from 'lucide-react';

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold mt-1" style={{ color: accent ?? '#E2E8F0' }}>
        {value}
      </p>
    </div>
  );
}

/**
 * "Dashboard" tab, sourced from the real GET /api/dashboard/summary
 * (backend/app/api/dashboard.py) -- every field below is confirmed
 * against the real response shape (shared/types/railsyncReal.ts).
 *
 * Also includes a live train schedule panel sourced from
 * GET /api/trains/ -- as of this writing that route does not exist
 * yet on the backend (the real data is loadable via CSVLoader but was
 * never wired to an endpoint; see backend_trains_endpoint_for_your_friend.py).
 * This panel is built and ready now, so it starts working with zero
 * frontend changes the moment that route goes live -- until then it
 * shows the same loading/error state as any other live-data panel.
 *
 * Train Schedule panel renders as a full Sun-Sat weekly timetable grid
 * (see TrainScheduleTable) rather than a paginated list, so it now
 * fetches the whole week at once instead of filtering by a single day.
 */
export function DashboardPage() {
  const [planningDate, setPlanningDate] = useState('2026-08-25');
  const [corridorId, setCorridorId] = useState('');

  const query = useDashboardSummary({ planning_date: planningDate, corridor_id: corridorId || undefined });
  const trainsQuery = useTrains({ corridor_id: corridorId || undefined });
  const d = query.data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard — Planning Status &amp; KPIs</CardTitle>
        </CardHeader>
        <div className="space-y-4">
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

          {d && (
            <>
              <div
                className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
                  d.safety_valid
                    ? 'border-signal-green/40 bg-signal-green/10 text-signal-green'
                    : 'border-dept-snt/40 bg-dept-snt/10 text-dept-snt'
                }`}
              >
                {d.safety_valid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>
                  {d.safety_valid ? 'All schedules safety-valid' : `Safety issues detected (penalty: ${d.safety_penalty})`}
                  {' · '}Optimizer status: <span className="font-medium">{d.optimizer_status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard label="Total Requests" value={d.total_requests} />
                <KpiCard label="Prioritized" value={d.prioritized_requests} accent="#38BDF8" />
                <KpiCard label="With Candidates" value={d.requests_with_candidates} accent="#A78BFA" />
                <KpiCard label="Total Candidates" value={d.total_candidates} />
                <KpiCard label="Coordination Opportunities" value={d.coordination_opportunities} accent="#F59E0B" />
                <KpiCard label="Scheduled" value={d.scheduled_requests} accent="#22C55E" />
                <KpiCard label="Unscheduled" value={d.unscheduled_requests} accent="#F43F5E" />
                <KpiCard label="Corridor Scope" value={d.corridor_id} />
              </div>
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrainFront size={16} />
            Train Schedule {trainsQuery.data ? `(${trainsQuery.data.count})` : ''}
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {trainsQuery.isLoading && (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <RefreshCw size={14} className="animate-spin" />
              Fetching live data — the backend may be cold-starting (can take up to ~90s)...
            </div>
          )}

          {trainsQuery.isError && (
            <div className="flex items-start gap-2 rounded-lg border border-signal-amber/40 bg-signal-amber/10 p-3 text-sm text-signal-amber">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Train schedule endpoint not available yet.</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  This needs a new <code>GET /api/trains/</code> route on the backend — the real data exists in
                  their CSV but isn't exposed via the API yet. Nothing wrong with the frontend; this will start
                  working automatically once that route is added.
                </p>
              </div>
            </div>
          )}

          {trainsQuery.data && <TrainScheduleTable trains={trainsQuery.data.trains ?? []} />}
        </div>
      </Card>
    </div>
  );
}