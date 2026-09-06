import { useState } from 'react';
import { RealTask } from '@/shared/types/railsyncReal';
import { ApprovalActions } from './ApprovalActions';
import { Badge } from '@/shared/components/ui/Badge';
import { computeRealPriorityScore, classifyRealPriority, priorityInputsFromTask } from '@/features/prioritization/utils/scoreFormatting';
import { PriorityBadge } from '@/features/prioritization/components/PriorityBadge';

const DEPARTMENT_COLORS: Record<string, string> = {
  Engineering: '#38BDF8',
  'S&T': '#F43F5E',
  Traction: '#F59E0B',
};

export type SortMode = 'priority' | 'urgency' | 'overdue';

const URGENCY_RANK: Record<string, number> = {
  IMMEDIATE: 0,
  HIGH: 1,
  MEDIUM: 2,
  NORMAL: 3,
  LOW: 4,
};

interface ApprovalCardProps {
  task: RealTask;
}

/**
 * One request awaiting controller review. Shows a SINGLE clear status
 * concept -- "Awaiting Approval" until a decision is submitted, then
 * "Approved"/"Rejected" -- rather than surfacing the backend's two
 * separate pending-ish fields (request_status='PENDING' and
 * controller_status='PENDING_REVIEW') as if they were two different
 * things needing separate attention. They aren't; approving here
 * resolves both.
 */
export function ApprovalCard({ task }: ApprovalCardProps) {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const score = computeRealPriorityScore(priorityInputsFromTask(task));
  const priorityClass = classifyRealPriority(score);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-slate-200">{task.maintenance_type}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {task.request_id} · {task.asset_type} ({task.asset_id})
          </p>
        </div>
        <Badge color={DEPARTMENT_COLORS[task.department]}>{task.department}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-500">Block</p>
          <p className="text-slate-300">
            {task.subsection_id} ({task.from_station}→{task.to_station})
          </p>
        </div>
        <div>
          <p className="text-slate-500">Urgency / Overdue</p>
          <p className="text-slate-300">
            {task.urgency} · {task.overdue_days}d
          </p>
        </div>
        <div>
          <p className="text-slate-500">Est. Duration</p>
          <p className="text-slate-300">{Math.round(task.estimated_duration_hours * 60)} min</p>
        </div>
        <div>
          <p className="text-slate-500">Priority</p>
          <PriorityBadge priorityClass={priorityClass} score={score} />
        </div>
      </div>

      {decision ? (
        <p className={decision === 'APPROVED' ? 'text-xs text-signal-green' : 'text-xs text-dept-snt'}>
          {decision === 'APPROVED' ? 'Approved.' : 'Rejected.'}
        </p>
      ) : (
        <ApprovalActions requestId={task.request_id} onDone={(approved) => setDecision(approved ? 'APPROVED' : 'REJECTED')} />
      )}
    </div>
  );
}

export function ApprovalQueue({ tasks, sortBy = 'priority' }: { tasks: RealTask[]; sortBy?: SortMode }) {
  if (tasks.length === 0) {
    return <p className="text-sm text-slate-500 py-6 text-center">No items awaiting approval.</p>;
  }

  const sorted = [...tasks].sort((a, b) => {
    if (sortBy === 'urgency') return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
    if (sortBy === 'overdue') return b.overdue_days - a.overdue_days;
    // 'priority' -- highest priority score first, using the same real formula as the Priorities tab
    const scoreA = computeRealPriorityScore(priorityInputsFromTask(a));
    const scoreB = computeRealPriorityScore(priorityInputsFromTask(b));
    return scoreB - scoreA;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((task) => (
        <ApprovalCard key={task.request_id} task={task} />
      ))}
    </div>
  );
}
