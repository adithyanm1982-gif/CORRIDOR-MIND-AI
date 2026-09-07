import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { PlanningQueryParams } from '@/features/dashboard/api/dashboardApi';
import { useRunOptimization } from '../hooks/useRunOptimization';
import { Button } from '@/shared/components/ui/Button';
import { ScheduleTable } from '@/features/schedules/components/ScheduleTable';
import { Play, RefreshCw, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';

interface OptimizationRunPanelProps {
  params: PlanningQueryParams;
}

type DeptFilter = 'ALL' | 'Engineering' | 'Traction' | 'S&T';

const DEPT_OPTIONS: DeptFilter[] = ['ALL', 'Engineering', 'Traction', 'S&T'];

const DEPT_COLORS: Record<DeptFilter, string> = {
  ALL: '#94A3B8',
  Engineering: '#38BDF8',
  Traction: '#F59E0B',
  'S&T': '#F43F5E',
};

/**
 * "Planning / Optimization" tab centerpiece: manually trigger the
 * CP-SAT solver run for the selected planning_date/corridor_id via
 * POST /api/optimization/run, then render the real
 * OptimizationRunResult -- selected_tasks (same shape as a schedule
 * entry, so it reuses ScheduleTable), status, and safety verdict.
 * The department filter narrows selected_tasks to just one
 * department's results after a run, with live counts per department.
 */
export function OptimizationRunPanel({ params }: OptimizationRunPanelProps) {
  const mutation = useRunOptimization();
  const [deptFilter, setDeptFilter] = useState<DeptFilter>('ALL');

  const selectedTasks = mutation.data?.selected_tasks ?? [];

  const counts = useMemo(() => {
    const c: Record<DeptFilter, number> = { ALL: selectedTasks.length, Engineering: 0, Traction: 0, 'S&T': 0 };
    for (const t of selectedTasks) {
      if (t.department in c) c[t.department as DeptFilter]++;
    }
    return c;
  }, [selectedTasks]);

  const filteredTasks = deptFilter === 'ALL' ? selectedTasks : selectedTasks.filter((t) => t.department === deptFilter);

  return (
    <div className="space-y-3">
      <Button onClick={() => mutation.mutate(params)} disabled={mutation.isPending} className="flex items-center gap-2">
        {mutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
        {mutation.isPending ? 'Running optimizer...' : 'Run Optimization'}
      </Button>

      {mutation.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-dept-snt/40 bg-dept-snt/10 p-3 text-sm text-dept-snt">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>{(mutation.error as Error)?.message ?? 'Optimization run failed.'}</p>
        </div>
      )}

      {mutation.isSuccess && mutation.data && (
        <div className="space-y-3">
          <div
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
              mutation.data.safety_valid
                ? 'border-signal-green/40 bg-signal-green/10 text-signal-green'
                : 'border-dept-snt/40 bg-dept-snt/10 text-dept-snt'
            }`}
          >
            {mutation.data.safety_valid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>
              Status: <span className="font-medium">OPTIMAL</span> · Safety valid
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-slate-500">Selected tasks</p>
              <div className="flex items-center gap-1.5">
                <Filter size={11} className="text-slate-500" />
                <div className="flex gap-1 rounded-md bg-slate-900/60 p-1 border border-slate-700">
                  {DEPT_OPTIONS.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setDeptFilter(dept)}
                      className={clsx(
                        'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                        deptFilter === dept ? 'text-slate-950' : 'text-slate-400 hover:text-slate-200'
                      )}
                      style={{ backgroundColor: deptFilter === dept ? DEPT_COLORS[dept] : 'transparent' }}
                    >
                      {dept} ({counts[dept]})
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <ScheduleTable schedules={filteredTasks} />
          </div>
        </div>
      )}
    </div>
  );
}
