// src/features/prioritization/components/PriorityBreakdownChart.tsx
import { realPriorityBreakdown, RealPriorityInputs } from '../utils/scoreFormatting';

const COMPONENT_LABELS: Record<string, string> = {
  safety_risk: 'Safety Risk (25%)',
  criticality: 'Criticality (20%)',
  operational_impact: 'Operational Impact (20%)',
  severity: 'Severity (15%)',
  urgency: 'Urgency (10%)',
  overdue: 'Overdue Days (10%)',
};

/**
 * Six-factor weighted breakdown matching the real backend priority
 * engine exactly (see features/prioritization/utils/scoreFormatting.ts).
 * Bars are white by default (dark mode); the `priority-bar-fill` class
 * is overridden to black in light mode via index.css, since a plain
 * white bar is invisible against a white page background.
 */
export function PriorityBreakdownChart({ input }: { input: RealPriorityInputs }) {
  const breakdown = realPriorityBreakdown(input);
  const entries = Object.entries(breakdown);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="space-y-0.5">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{COMPONENT_LABELS[key]}</span>
            <span>{value.toFixed(1)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full priority-bar-fill"
              style={{ width: `${(value / max) * 100}%`, backgroundColor: '#FFFFFF' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}