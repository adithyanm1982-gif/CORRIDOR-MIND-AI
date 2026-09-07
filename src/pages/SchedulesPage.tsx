import { useState } from 'react';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import { ScheduleTable } from '@/features/schedules/components/ScheduleTable';
import { PlanningDateSelector } from '@/shared/components/ui/PlanningDateSelector';
import { LiveDataPanel } from '@/shared/components/ui/LiveDataPanel';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/Card';

/**
 * "Schedules" tab: the real GET /api/schedules/ feed -- the CP-SAT
 * optimizer's final selected task-to-block assignments, with real
 * date/time/corridor/section/duration/work fields.
 */
export function SchedulesPage() {
  const [planningDate, setPlanningDate] = useState('2026-08-25');
  const [corridorId, setCorridorId] = useState('');
  const [department, setDepartment] = useState('');

  const query = useSchedules({
    planning_date: planningDate,
    corridor_id: corridorId || undefined,
    department: department || undefined,
  });

  const schedules = query.data?.schedules ?? [];
  const filtered = department ? schedules.filter((s) => s.department === department) : schedules;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final Recommended Schedules</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <PlanningDateSelector
            planningDate={planningDate}
            corridorId={corridorId}
            onPlanningDateChange={setPlanningDate}
            onCorridorIdChange={setCorridorId}
            onRefresh={() => query.refetch()}
            isFetching={query.isFetching}
          />
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="rounded-md bg-slate-900/60 border border-slate-700 px-2.5 py-1.5 text-xs"
            >
              <option value="">All</option>
              <option value="Engineering">Engineering</option>
              <option value="S&T">S&T</option>
              <option value="Traction">Traction</option>
            </select>
          </div>
        </div>
        {query.data?.safety_valid === false && (
          <p className="text-xs text-dept-snt">⚠ This schedule set has unresolved safety issues.</p>
        )}
        {query.isLoading || query.isError ? <LiveDataPanel query={query} /> : <ScheduleTable schedules={filtered} />}
      </div>
    </Card>
  );
}
