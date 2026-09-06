import { useState } from 'react';
import { RealTask } from '@/shared/types/railsyncReal';
import { Badge } from '@/shared/components/ui/Badge';

const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: '#38BDF8',
  'S&T': '#F43F5E',
  Traction: '#F59E0B',
};

const URGENCY_COLORS: Record<string, string> = {
  IMMEDIATE: '#F43F5E',
  HIGH: '#F59E0B',
  MEDIUM: '#38BDF8',
  NORMAL: '#94A3B8',
  LOW: '#22C55E',
};

const PAGE_SIZE = 25;

/**
 * Table for the real GET /api/tasks/ feed (420 records). Every column
 * maps 1:1 to a confirmed RealTask field -- no guessed field names.
 */
export function RealTaskList({ tasks }: { tasks: RealTask[] }) {
  const [page, setPage] = useState(0);

  if (tasks.length === 0) {
    return <p className="text-sm text-slate-500 py-6 text-center">No requests match this filter.</p>;
  }

  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const pageItems = tasks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
              <th className="py-2 pr-3">Request</th>
              <th className="py-2 pr-3">Dept</th>
              <th className="py-2 pr-3">Block</th>
              <th className="py-2 pr-3">Asset</th>
              <th className="py-2 pr-3">Urgency</th>
              <th className="py-2 pr-3">Overdue</th>
              <th className="py-2 pr-3">Est. Duration</th>
              <th className="py-2 pr-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((t) => (
              <tr key={t.request_id} className="border-b border-slate-800/60 hover:bg-slate-900/40">
                <td className="py-2 pr-3">
                  <p className="text-slate-200">{t.maintenance_type}</p>
                  <p className="text-xs text-slate-500">
                    {t.request_id} · {t.issue}
                  </p>
                </td>
                <td className="py-2 pr-3">
                  <Badge color={DEPARTMENT_COLORS[t.department]}>{t.department}</Badge>
                </td>
                <td className="py-2 pr-3 text-slate-300">
                  {t.subsection_id}
                  <p className="text-[10px] text-slate-500">
                    {t.from_station}→{t.to_station}
                  </p>
                </td>
                <td className="py-2 pr-3 text-slate-400 text-xs">
                  {t.asset_type}
                  <p className="text-[10px] text-slate-500">{t.asset_id}</p>
                </td>
                <td className="py-2 pr-3">
                  <Badge color={URGENCY_COLORS[t.urgency]}>{t.urgency}</Badge>
                </td>
                <td className="py-2 pr-3 text-slate-400">{t.overdue_days}d</td>
                <td className="py-2 pr-3 text-slate-400">{Math.round(t.estimated_duration_hours * 60)} min</td>
                <td className="py-2 pr-3 text-slate-500 text-xs">{t.planning_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span>
            {tasks.length} requests · Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md border border-slate-700 px-2 py-1 disabled:opacity-30"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="rounded-md border border-slate-700 px-2 py-1 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
