import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Play, Pause, RotateCcw, Shuffle, AlertCircle, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { minutesToTimeString } from '../utils/timeUtils';

const SPEED_OPTIONS = [1, 2, 5, 10, 20];

interface SimulationControlBarProps {
  optimizationToast?: string | null;
  showDepartmentBar?: boolean;
  onToggleDepartmentBar?: () => void;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({
  optimizationToast,
  showDepartmentBar,
  onToggleDepartmentBar
}) => {
  const {
    isRunning,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    speed,
    setSpeed,
    simTimeMinutes,
    timeFormatted,
    jumpToTime,
    triggerDemoConflict,
    triggerDemoImpact,
    activeConflict
  } = useSimulation();

  // Format date and time string matching reference image:
  // "Thursday, 2026-08-27 · 00:05:30"
  const getReferenceFormattedDate = () => {
    const hours = Math.floor(simTimeMinutes / 60);
    const mins = simTimeMinutes % 60;
    const secs = 0;
    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `Thursday, 2026-08-27 · ${hh}:${mm}:${ss}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetMinutes = Math.round(fraction * 1440);
    jumpToTime(targetMinutes);
  };

  const progressPercent = Math.max(0, Math.min(100, (simTimeMinutes / 1440) * 100));

  return (
    <div className="bg-[#05080F] border-t border-[#141B28] px-4 py-2.5 text-[#E0E6ED] select-none shrink-0 font-mono text-xs z-30">
      {/* 1. TOP ROW: Exact Reference Date/Time Left & Schedule Window Right */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
        {/* Left Date / Time Display matching Reference Image: Thursday, 2026-08-27 · 00:05:30 */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-[#38BDF8] font-bold text-xs sm:text-sm tracking-wider drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              {getReferenceFormattedDate()}
            </span>
          </div>

          {/* Quick Play/Pause/Reset Controls */}
          <div className="flex items-center gap-1.5 ml-2">
            {isRunning ? (
              <button
                onClick={pauseSimulation}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#450A0A] hover:bg-[#7F1D1D] text-rose-300 font-mono font-bold text-[10px] rounded border border-red-500/40 transition cursor-pointer"
                title="Pause Simulation Clock"
              >
                <Pause className="w-3 h-3 fill-current" />
                <span>PAUSE</span>
              </button>
            ) : (
              <button
                onClick={startSimulation}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#064E3B] hover:bg-[#059669] text-emerald-300 font-mono font-bold text-[10px] rounded border border-emerald-400/40 transition cursor-pointer"
                title="Start Simulation Clock"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>PLAY</span>
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="p-1 text-[#64748B] hover:text-white rounded hover:bg-[#151D2F] transition cursor-pointer"
              title="Reset to 00:00"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center Speed Controls & Demo Triggers */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-[#090E1A] p-0.5 rounded border border-[#1A2234]">
            {SPEED_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setSpeed(opt)}
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded transition cursor-pointer ${
                  speed === opt
                    ? 'bg-[#13283E] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                    : 'text-[#64748B] hover:text-[#CBD5E1]'
                }`}
              >
                {opt}x
              </button>
            ))}
          </div>

          {/* Test Conflict */}
          <button
            onClick={triggerDemoConflict}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border transition cursor-pointer ${
              activeConflict && !activeConflict.isResolved
                ? 'bg-red-950/60 text-red-200 border-red-500 animate-pulse'
                : 'bg-[#0E1524] hover:bg-[#172136] text-[#94A3B8] hover:text-white border-[#232D3F]'
            }`}
            title="Inject test maintenance conflict at SB-03"
          >
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span className="hidden md:inline">Test Conflict</span>
          </button>

          {/* Test Impact */}
          <button
            onClick={triggerDemoImpact}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded border bg-[#0E1524] hover:bg-[#172136] text-[#38BDF8] border-[#38BDF8]/40 transition cursor-pointer"
            title="Demonstrate train operational impact on Track 1 and alternative route"
          >
            <Shuffle className="w-3 h-3" />
            <span className="hidden md:inline">Test Impact</span>
          </button>

          {/* Toggle Department Status Bar Drawer */}
          {onToggleDepartmentBar && (
            <button
              onClick={onToggleDepartmentBar}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded border transition cursor-pointer ${
                showDepartmentBar
                  ? 'bg-[#13283E] text-[#38BDF8] border-[#38BDF8]/40'
                  : 'bg-[#0E1524] text-[#94A3B8] hover:text-white border-[#232D3F]'
              }`}
              title="Toggle Department Crew Details"
            >
              <span>Departments</span>
              {showDepartmentBar ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Right Label matching Reference Image: Real 7-day schedule window · 2026-08-27 → 2026-09-02 */}
        <div className="text-[11px] text-[#64748B] font-mono whitespace-nowrap hidden lg:block">
          Real 7-day schedule window · <span className="text-[#94A3B8]">2026-08-27 → 2026-09-02</span>
        </div>
      </div>

      {/* 2. TIMELINE SLIDER RAIL MATCHING REFERENCE MODEL */}
      <div className="relative w-full pt-1 pb-1">
        <div
          onClick={handleTimelineClick}
          className="relative h-4 w-full cursor-pointer flex items-center group"
          title="Click or drag to scrub 24-hour simulation time"
        >
          {/* Background rail */}
          <div className="h-1.5 w-full bg-[#141B28] rounded-full relative overflow-hidden border border-[#1E2533]">
            {/* Progress fill */}
            <div
              className="h-full bg-[#38BDF8]/80 transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Cyan Thumb Indicator matching Reference Image */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-75 z-20"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-[#38BDF8] border-2 border-white shadow-[0_0_12px_#38BDF8] group-hover:scale-125 transition-transform" />
          </div>
        </div>

        {/* Subtle hour tick markers below */}
        <div className="flex justify-between text-[9px] font-mono text-[#475569] px-1 mt-0.5">
          {['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '24:00'].map(hour => (
            <span
              key={hour}
              className="hover:text-[#38BDF8] cursor-pointer transition"
              onClick={() => {
                const [h] = hour.split(':').map(Number);
                jumpToTime(h * 60);
              }}
            >
              {hour}
            </span>
          ))}
        </div>
      </div>

      {/* Optimization Toast if present */}
      {optimizationToast && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded animate-fade-in justify-center">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{optimizationToast}</span>
        </div>
      )}
    </div>
  );
};
