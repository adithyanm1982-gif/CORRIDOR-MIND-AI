// src/pages/PrioritiesPage.tsx
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { prioritiesApi } from '@/features/prioritization/api/prioritiesApi';
import { PriorityRankingList } from '@/features/prioritization/components/PriorityRankingList';
import { PriorityClass } from '@/shared/types/railsyncReal';
import { PRIORITY_CLASS_COLORS } from '@/features/prioritization/utils/scoreFormatting';
import { PlanningDateSelector } from '@/shared/components/ui/PlanningDateSelector';
import { LiveDataPanel } from '@/shared/components/ui/LiveDataPanel';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/Card';

type ClassFilter = PriorityClass | 'ALL';

const FILTERS: ClassFilter[] = ['ALL', 'Critical', 'High', 'Medium', 'Low'];
const MAX_REQUESTS = 50;

/**
 * "Priorities" tab: the real GET /api/priorities/ feed, already
 * sorted by the backend's PriorityEngine (0-100 scale, six weighted
 * factors -- see features/prioritization/utils/scoreFormatting.ts for
 * the exact replica of backend/priority_engine.py).
 *
 * The class filter bar below lets you jump straight to any one tier
 * (Critical/High/Medium/Low) -- without it, Medium and Low items were
 * effectively unreachable whenever there were 50+ Critical/High items
 * ranked ahead of them in one long list.
 *
 * Capped to the top 50 highest-scored requests overall (the backend
 * already returns them sorted high->low), rather than the full feed.
 */
export function PrioritiesPage() {
  const [planningDate, setPlanningDate] = useState('2026-08-25');
  const [corridorId, setCorridorId] = useState('');
  const [classFilter, setClassFilter] = useState<ClassFilter>('ALL');

  const query = useQuery({
    queryKey: ['priorities', planningDate, corridorId],
    queryFn: () => prioritiesApi.list({ planning_date: planningDate, corridor_id: corridorId || undefined }),
    retry: 1,
  });

  const allRequests = (query.data?.requests ?? []).slice(0, MAX_REQUESTS);

  const counts = useMemo(() => {
    const c: Record<ClassFilter, number> = { ALL: allRequests.length, Critical: 0, High: 0, Medium: 0, Low: 0 };
    for (const r of allRequests) c[r.priority_class]++;
    return c;
  }, [allRequests]);

  const filtered = classFilter === 'ALL' ? allRequests : allRequests.filter((r) => r.priority_class === classFilter);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Priority Ranking {query.data ? `(${allRequests.length})` : ''}</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Score = Safety Risk×0.25 + Criticality×0.20 + Operational Impact×0.20 + Severity×0.15 + Urgency×0.10 +
          Overdue×0.10, each normalized to 0–100. Critical ≥75, High ≥55, Medium ≥35, else Low.
        </p>
        <PlanningDateSelector
          planningDate={planningDate}
          corridorId={corridorId}
          onPlanningDateChange={setPlanningDate}
          onCorridorIdChange={setCorridorId}
          onRefresh={() => query.refetch()}
          isFetching={query.isFetching}
        />

        {/* Sort/filter by priority class */}
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const isActive = classFilter === f;
            const color = f === 'ALL' ? '#94A3B8' : PRIORITY_CLASS_COLORS[f];
            return (
              <button
                key={f}
                onClick={() => setClassFilter(f)}
                className={clsx(
                  'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                  isActive ? 'text-slate-950' : 'text-slate-300 hover:bg-slate-800/60'
                )}
                style={{
                  backgroundColor: isActive ? color : 'transparent',
                  borderColor: `${color}66`,
                }}
              >
                {f} ({counts[f]})
              </button>
            );
          })}
        </div>

        {query.isLoading || query.isError ? <LiveDataPanel query={query} /> : <PriorityRankingList requests={filtered} />}
      </div>
    </Card>
  );
}