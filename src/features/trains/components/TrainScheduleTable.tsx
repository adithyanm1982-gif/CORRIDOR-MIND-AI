// src/features/trains/components/TrainScheduleTable.tsx
import { useMemo, useState } from 'react';
import { RealTrainMovement } from '@/shared/types/railsyncReal';

const DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAX_PER_DAY = 8; // representative sample, not the full dataset
const MAX_PER_CELL = 2;

type TimeFormat = '24h' | 'ampm';

function parseMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatHour(hour: number, format: TimeFormat): string {
  if (format === '24h') return `${String(hour).padStart(2, '0')}:00`;
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

function formatTime(t: string, format: TimeFormat): string {
  const mins = parseMinutes(t);
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  if (format === '24h') return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')}${period}`;
}

/** Evenly samples up to `max` entries across the sorted list, so the picks span the full day rather than clustering. */
function sampleEvenly<T>(items: T[], max: number): T[] {
  if (items.length <= max) return items;
  const step = items.length / max;
  const out: T[] = [];
  for (let i = 0; i < max; i++) {
    out.push(items[Math.floor(i * step)]);
  }
  return out;
}

export function TrainScheduleTable({ trains = [] }: { trains?: RealTrainMovement[] }) {
  const [format, setFormat] = useState<TimeFormat>('24h');

  const { byDayHour, hourRange, totalShown } = useMemo(() => {
    const byDay: Record<string, RealTrainMovement[]> = {};
    DAYS_ORDER.forEach((d) => (byDay[d] = []));
    for (const t of trains) {
      if (byDay[t.day]) byDay[t.day].push(t);
    }

    const sampledByDay: Record<string, RealTrainMovement[]> = {};
    let shown = 0;
    for (const day of DAYS_ORDER) {
      const sorted = [...byDay[day]].sort((a, b) => a.entry_time.localeCompare(b.entry_time));
      const sample = sampleEvenly(sorted, MAX_PER_DAY);
      sampledByDay[day] = sample;
      shown += sample.length;
    }

    // Bucket sampled entries by hour, and find the active hour range so we don't render dead rows.
    const byDayHour: Record<string, Record<number, RealTrainMovement[]>> = {};
    let minHour = 23;
    let maxHour = 0;
    DAYS_ORDER.forEach((day) => {
      byDayHour[day] = {};
      for (const t of sampledByDay[day]) {
        const hour = Math.floor(parseMinutes(t.entry_time) / 60);
        if (!byDayHour[day][hour]) byDayHour[day][hour] = [];
        byDayHour[day][hour].push(t);
        minHour = Math.min(minHour, hour);
        maxHour = Math.max(maxHour, hour);
      }
    });

    if (shown === 0) {
      minHour = 5;
      maxHour = 22;
    }

    return { byDayHour, hourRange: { min: minHour, max: maxHour }, totalShown: shown };
  }, [trains]);

  if (trains.length === 0) {
    return <p className="text-sm text-slate-500 py-6 text-center">No train movements for this filter.</p>;
  }

  const hours = Array.from({ length: hourRange.max - hourRange.min + 1 }, (_, i) => hourRange.min + i);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing {totalShown} representative departures of {trains.length} total
        </p>
        <div className="inline-flex rounded-md border border-slate-700 overflow-hidden text-[10px]">
          <button
            onClick={() => setFormat('24h')}
            className={`px-2 py-1 ${format === '24h' ? 'bg-slate-700 text-slate-100' : 'bg-slate-900/50 text-slate-500'}`}
          >
            24h
          </button>
          <button
            onClick={() => setFormat('ampm')}
            className={`px-2 py-1 ${format === 'ampm' ? 'bg-slate-700 text-slate-100' : 'bg-slate-900/50 text-slate-500'}`}
          >
            AM/PM
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-16 border-b border-r border-slate-800 bg-slate-900/60 p-2" />
              {DAYS_ORDER.map((day) => (
                <th
                  key={day}
                  className="border-b border-r border-slate-800 bg-slate-900/60 p-2 text-center font-medium text-slate-300 last:border-r-0"
                >
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="border-b border-r border-slate-800 bg-slate-900/30 p-2 text-right align-top text-[10px] text-slate-500 whitespace-nowrap">
                  {formatHour(hour, format)}
                </td>
                {DAYS_ORDER.map((day) => {
                  const entries = byDayHour[day][hour] ?? [];
                  const visible = entries.slice(0, MAX_PER_CELL);
                  const overflow = entries.length - visible.length;
                  return (
                    <td key={day} className="border-b border-r border-slate-800 p-1.5 align-top last:border-r-0">
                      <div className="flex flex-col gap-1">
                        {visible.map((t) => (
                          <div
                            key={t.movement_id}
                            title={`${t.from_station} → ${t.to_station} · ${t.corridor_id}/${t.subsection_id} · ${t.movement_status}`}
                            className="rounded border border-slate-700 bg-slate-900/50 px-1.5 py-1"
                          >
                            <p className="text-slate-200 font-medium truncate">
                              #{t.train_no} <span className="text-slate-500">{t.direction === 'UP' ? '↑' : '↓'}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {t.from_station}→{t.to_station}
                            </p>
                            <p className="text-[10px] text-slate-500">{formatTime(t.entry_time, format)}</p>
                          </div>
                        ))}
                        {overflow > 0 && (
                          <p className="text-[10px] text-slate-600 pl-1">+{overflow} more</p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}