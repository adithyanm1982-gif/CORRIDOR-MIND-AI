// src/features/dashboard/components/DepartmentBlockTimetable.tsx
import { useMemo, useState } from 'react';
import { RealScheduleEntry } from '@/shared/types/railsyncReal';

const DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAX_PER_CELL = 2;

const DEPT_LABEL: Record<string, string> = {
  Engineering: 'ENG',
  'S&T': 'S&T',
  Traction: 'TRD',
};

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

export function DepartmentBlockTimetable({ schedules = [] }: { schedules?: RealScheduleEntry[] }) {
  const [format, setFormat] = useState<TimeFormat>('24h');

  const { byDayHour, hourRange } = useMemo(() => {
    const byDayHour: Record<string, Record<number, RealScheduleEntry[]>> = {};
    let minHour = 23;
    let maxHour = 0;

    DAYS_ORDER.forEach((day) => (byDayHour[day] = {}));

    for (const s of schedules) {
      if (!byDayHour[s.day]) continue; // unrecognized day value, skip defensively
      const hour = Math.floor(parseMinutes(s.start_time) / 60);
      if (!byDayHour[s.day][hour]) byDayHour[s.day][hour] = [];
      byDayHour[s.day][hour].push(s);
      minHour = Math.min(minHour, hour);
      maxHour = Math.max(maxHour, hour);
    }

    if (schedules.length === 0) {
      minHour = 5;
      maxHour = 22;
    }

    return { byDayHour, hourRange: { min: minHour, max: maxHour } };
  }, [schedules]);

  if (schedules.length === 0) {
    return <p className="text-sm text-slate-500 py-6 text-center">No block assignments for this filter.</p>;
  }

  const hours = Array.from({ length: hourRange.max - hourRange.min + 1 }, (_, i) => hourRange.min + i);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500"> Block Assignments this week</p>

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
                        {visible.map((s) => (
                          <div
                            key={s.request_id}
                            title={`${s.department} · ${s.maintenance_type} on ${s.asset_type}\n${s.from_station} → ${s.to_station}\n${s.start_time} → ${s.end_time}\nBlock type: ${s.block_type.replace(/_/g, ' ')}`}
                            className="rounded border border-slate-700 bg-slate-900/50 px-1.5 py-1"
                          >
                            <p className="text-slate-200 font-medium truncate">
                              {DEPT_LABEL[s.department] ?? s.department}{' '}
                              <span className="text-slate-500 font-normal">
                                {s.corridor_id}/{s.subsection_id}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {formatTime(s.start_time, format)}–{formatTime(s.end_time, format)}
                            </p>
                          </div>
                        ))}
                        {overflow > 0 && <p className="text-[10px] text-slate-600 pl-1">+{overflow} more</p>}
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