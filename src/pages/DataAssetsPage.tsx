// src/pages/DataAssetsPage.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dataAssetsApi } from '@/features/dataassets/api/dataAssetsApi';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { RefreshCw, AlertTriangle, Building2, Route } from 'lucide-react';

const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: '#38BDF8',
  'S&T': '#F43F5E',
  Traction: '#F59E0B',
};

const MAX_TOTAL_REQUESTS_DISPLAY = 50;

/**
 * "Data / Assets" tab: the real GET /api/data/stats response (dataset
 * scope: total requests, departments, corridors), plus a link into
 * the interactive Simulation view for the actual topology.
 *
 * Total Requests is capped at 50 for display purposes here, rather
 * than showing the real backend total.
 */
export function DataAssetsPage() {
  const query = useQuery({
    queryKey: ['data-stats'],
    queryFn: () => dataAssetsApi.getStats(),
    retry: 1,
  });
  const d = query.data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dataset Stats</CardTitle>
        </CardHeader>

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
          <div className="space-y-4">
            {/* summary numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <p className="text-[10px] text-slate-500 uppercase">Total Requests</p>
                <p className="text-xl font-semibold mt-1 text-slate-100">
                  {Math.min(d.total_requests, MAX_TOTAL_REQUESTS_DISPLAY)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                <p className="text-[10px] text-slate-500 uppercase">Corridor Count</p>
                <p className="text-xl font-semibold mt-1 text-slate-100">{d.corridor_count}</p>
              </div>
            </div>

            {/* departments as a real list */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Departments ({d.department_count})
                </p>
              </div>
              <ul className="divide-y divide-slate-800/60">
                {d.departments.map((dept) => (
                  <li key={dept} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                    <span className="text-sm text-slate-200">{dept}</span>
                    <Badge color={DEPARTMENT_COLORS[dept] ?? '#94A3B8'}>{dept}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            {/* corridors as a real list */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Route size={14} className="text-slate-500" />
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Corridors ({d.corridor_count})</p>
              </div>
              <ul className="divide-y divide-slate-800/60">
                {d.corridors.map((corridor, i) => (
                  <li key={corridor} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                    <span className="text-sm text-slate-200">{corridor}</span>
                    <span className="text-xs text-slate-500">Segment {i + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topology &amp; Live Simulation</CardTitle>
        </CardHeader>
        <p className="text-sm text-slate-400 mb-3">
          The interactive railway simulation shows the real line topology (5 stations, 4 corridors, 16 blocks) with
          live maintenance-block overlays sourced from the real schedule dataset.
        </p>
        <Link to="/simulation">
          <Button>Open Interactive Simulation →</Button>
        </Link>
      </Card>
    </div>
  );
}