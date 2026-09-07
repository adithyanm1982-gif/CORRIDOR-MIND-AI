import { RealTask } from '@/shared/types/railsyncReal';
import {
  computeRealPriorityScore,
  classifyRealPriority,
  priorityInputsFromTask,
  realPriorityBreakdown,
} from '@/features/prioritization/utils/scoreFormatting';

const FACTOR_LABELS: Record<string, string> = {
  safety_risk: 'safety risk',
  criticality: 'asset criticality',
  operational_impact: 'operational impact',
  severity: 'issue severity',
  urgency: 'urgency level',
  overdue: 'overdue duration',
};

export interface AIExplanation {
  score: number;
  priorityClass: string;
  headline: string;
  dominantFactor: string;
  reasons: string[];
}

/**
 * Builds a human-readable explanation of why a request scored the way
 * it did, using its real priority breakdown (same six weighted factors
 * as the Priorities tab, from scoreFormatting.ts) plus its overdue/
 * urgency/block fields. This is derived analysis of real request data
 * -- not a canned or random per-request text -- so it stays consistent
 * with whatever the backend actually returned for that request.
 */
export function explainRequest(task: RealTask): AIExplanation {
  const inputs = priorityInputsFromTask(task);
  const score = computeRealPriorityScore(inputs);
  const priorityClass = classifyRealPriority(score);
  const breakdown = realPriorityBreakdown(inputs);

  const entries = Object.entries(breakdown) as [string, number][];
  const [dominantKey, dominantValue] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const dominantFactor = FACTOR_LABELS[dominantKey] ?? dominantKey;

  const reasons: string[] = [];

  reasons.push(
    `Scored ${score.toFixed(1)}/100 (${priorityClass}), driven mainly by ${dominantFactor} (${dominantValue.toFixed(1)} of its weighted contribution).`
  );

  if (task.overdue_days > 0) {
    reasons.push(
      `This request is ${task.overdue_days} day${task.overdue_days === 1 ? '' : 's'} past its original deadline (${task.deadline_day}), which raises its urgency ranking.`
    );
  } else {
    reasons.push(`Not yet overdue -- still within its planning window (deadline: ${task.deadline_day}).`);
  }

  reasons.push(
    `Flagged as ${task.urgency} urgency by the department, for a ${task.maintenance_type.toLowerCase()} on ${task.asset_type} (${task.asset_id}).`
  );

  reasons.push(
    `Located on Block ${task.subsection_id} (Corridor ${task.corridor_id}, ${task.from_station} → ${task.to_station}) -- safety risk ${inputs.safety_risk}/100, operational impact ${inputs.operational_impact}/100.`
  );

  if (task.approval_required) {
    reasons.push('Marked as requiring explicit controller approval before any block can be allocated.');
  }

  const headline =
    priorityClass === 'Critical'
      ? 'High-confidence recommendation: approve promptly.'
      : priorityClass === 'High'
      ? 'Recommended for approval within the current planning cycle.'
      : priorityClass === 'Medium'
      ? 'Moderate priority -- safe to schedule in a normal window.'
      : 'Low priority -- can be deferred without significant risk.';

  return { score, priorityClass, headline, dominantFactor, reasons };
}