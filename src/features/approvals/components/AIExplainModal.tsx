import { RealTask, PriorityClass } from '@/shared/types/railsyncReal';
import { explainRequest } from '../utils/explainability';
import { PriorityBadge } from '@/features/prioritization/components/PriorityBadge';
import { Sparkles, X } from 'lucide-react';

interface AIExplainModalProps {
  task: RealTask;
  open: boolean;
  onClose: () => void;
}

/**
 * Renders as an anchored popover directly below whatever trigger button
 * it's placed next to (its parent must be `relative` -- see
 * ApprovalQueue.tsx), NOT a full-screen centered modal. A transparent
 * full-screen layer still exists purely to catch outside clicks and
 * close the popover, but it has no visible dimming.
 */
export function AIExplainModal({ task, open, onClose }: AIExplainModalProps) {
  if (!open) return null;
  const explanation = explainRequest(task);

  return (
    <>
      {/* invisible click-outside catcher, not a visual backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute left-0 top-full mt-2 z-50 w-[22rem] max-w-[90vw] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-100">AI Explainability — {task.request_id}</p>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-dept-engineering" />
          <PriorityBadge priorityClass={explanation.priorityClass as PriorityClass} score={explanation.score} />
        </div>

        <p className="text-sm text-slate-200 font-medium">{explanation.headline}</p>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {explanation.reasons.map((reason, i) => (
            <p key={i} className="text-xs text-slate-400 leading-relaxed pl-3 border-l-2 border-slate-700">
              {reason}
            </p>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-500">Priority Score</p>
            <p className="text-slate-200 font-semibold">{explanation.score.toFixed(1)} / 100</p>
          </div>
          <div>
            <p className="text-slate-500">Overdue</p>
            <p className="text-slate-200 font-semibold">{task.overdue_days}d</p>
          </div>
        </div>
      </div>
    </>
  );
}