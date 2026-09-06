// src/pages/DashboardPage.tsx
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboardSummary';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import { DepartmentBlockTimetable } from '@/features/dashboard/components/DepartmentBlockTimetable';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { RefreshCw, AlertTriangle, CheckCircle2, CalendarClock } from 'lucide-react';

const PLANNING_DATE = '2026-08-25';
const CORRIDOR_ID = undefined;

/**
 * "Dashboard" tab, sourced from the real GET /api/dashboard/summary
 * (backend/app/api/dashboard.py) -- every field below is confirmed
 * against the real response shape (shared/types/railsyncReal.ts).
 *
 * Also includes a weekly department/block timetable panel sourced from
 * the same real GET /api/schedules/ feed used on the Schedules page
 * (CP-SAT optimizer's selected task->block assignments), rendered as a
 * clean Sun-Sat grid instead of a list -- see DepartmentBlockTimetable.
 *
 * The Planning Date / Corridor ID controls were removed from this page;
 * both queries now run against a fixed planning date and all corridors.
 * That control still exists on the Schedules page if per-date/corridor
 * filtering is needed elsewhere.
 */
export function DashboardPage() {
  const query = useDashboardSummary({ planning_date: PLANNING_DATE, corridor_id: CORRIDOR_ID });
  const schedulesQuery = useSchedules({ planning_date: PLANNING_DATE, corridor_id: CORRIDOR_ID });
  const d = query.data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard — Planning Status &amp; KPIs</CardTitle>
        </CardHeader>
        <div className="space-y-4">
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
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock size={16} />
            Weekly Block Schedule {schedulesQuery.data ? `(${schedulesQuery.data.count})` : ''}
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {schedulesQuery.isLoading && (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <RefreshCw size={14} className="animate-spin" />
              Fetching live data — the backend may be cold-starting (can take up to ~90s)...
            </div>
          )}

          {schedulesQuery.isError && (
            <div className="flex items-start gap-2 rounded-lg border border-dept-snt/40 bg-dept-snt/10 p-3 text-sm text-dept-snt">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>{(schedulesQuery.error as Error)?.message ?? 'Could not reach the backend.'}</p>
            </div>
          )}

          {schedulesQuery.data?.safety_valid === false && (
            <p className="text-xs text-dept-snt">⚠ This schedule set has unresolved safety issues.</p>
          )}

          {schedulesQuery.data && <DepartmentBlockTimetable schedules={schedulesQuery.data.schedules ?? []} />}
        </div>
      </Card>
    </div>
  );
}