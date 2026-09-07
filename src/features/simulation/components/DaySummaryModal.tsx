import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { DEPARTMENTS } from '../data/corridorData';
import { formatDuration } from '../utils/timeUtils';
import {
  CheckCircle2,
  RotateCcw,
  Clock,
  ShieldCheck,
  Award,
  Layers,
  FileText,
  X,
  Sparkles,
  TrendingUp,
  Share2
} from 'lucide-react';

export const DaySummaryModal: React.FC = () => {
  const {
    showDaySummary,
    setShowDaySummary,
    runAgain,
    jumpToTime,
    metrics,
    tasks,
    conflicts
  } = useSimulation();

  if (!showDaySummary) return null;

  const engStats = metrics.departmentBreakdown.engineering;
  const trdStats = metrics.departmentBreakdown.traction;
  const sntStats = metrics.departmentBreakdown.signaling;

  const totalCompleted = metrics.completedTasks;
  const totalTasks = metrics.totalTasks;
  const totalMins = metrics.totalMaintenanceMinutes;
  const hoursFormatted = (totalMins / 60).toFixed(1);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowDaySummary(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B0E14]/85 backdrop-blur-md animate-fade-in select-none"
    >
      <div className="bg-[#12161F] border border-[#2A2F3A] rounded max-w-2xl w-full text-[#E0E6ED] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Banner */}
        <div className="bg-[#161B22] p-5 border-b border-[#2A2F3A] relative">
          <button
            onClick={() => setShowDaySummary(false)}
            className="absolute top-4 right-4 p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1A1F26] rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8] font-mono">
                  Smart India Hackathon SIH26027
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1F26] text-[#4ADE80] border border-emerald-700/60">
                  Simulation Complete
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                24-HOUR BLOCK PLANNING AUDIT SUMMARY
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">
                Corridor Asset Availability & Cross-Department Coordination Report
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-[#161B22] p-3 rounded border border-[#2A2F3A]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1 font-mono">Total Tasks</span>
              <span className="text-xl font-bold font-mono text-white">{totalCompleted} <span className="text-xs text-[#64748B] font-normal">/ {totalTasks}</span></span>
              <span className="text-[10px] text-[#4ADE80] block mt-0.5 font-mono">100% On-Schedule</span>
            </div>

            <div className="bg-[#161B22] p-3 rounded border border-[#2A2F3A]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1 font-mono">Coord. Efficiency</span>
              <span className="text-xl font-bold font-mono text-[#38BDF8]">{metrics.coordinationEfficiencyScore}%</span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5 font-mono">Optimized Slots</span>
            </div>

            <div className="bg-[#161B22] p-3 rounded border border-[#2A2F3A]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1 font-mono">Conflicts Resolved</span>
              <span className="text-xl font-bold font-mono text-[#FBBF24]">{metrics.conflictsResolved} <span className="text-xs text-[#64748B] font-normal">/ {metrics.conflictsDetected}</span></span>
              <span className="text-[10px] text-[#4ADE80] block mt-0.5 font-mono">Zero Residual</span>
            </div>

            <div className="bg-[#161B22] p-3 rounded border border-[#2A2F3A]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1 font-mono">Maintenance Time</span>
              <span className="text-xl font-bold font-mono text-[#C084FC]">{hoursFormatted} <span className="text-xs text-[#64748B] font-normal">hrs</span></span>
              <span className="text-[10px] text-[#94A3B8] block mt-0.5 font-mono">10 Sub-Blocks</span>
            </div>
          </div>

          {/* Department Performance Breakdown */}
          <div className="bg-[#161B22] p-4 rounded border border-[#2A2F3A] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between font-mono">
              <span>Department Performance Breakdown</span>
              <span className="text-[11px] font-mono text-[#64748B]">{totalCompleted} tasks completed</span>
            </h3>

            <div className="space-y-3 font-mono">
              {/* Engineering */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="indicator bg-[#38BDF8]" />
                    <span className="font-bold text-[#38BDF8]">Engineering Department</span>
                  </div>
                  <span className="text-[#94A3B8]">
                    {engStats.completed} tasks ({Math.round(engStats.totalMinutes / 60)} hrs)
                  </span>
                </div>
                <div className="progress-bar w-full">
                  <div className="bg-[#38BDF8] h-full" style={{ width: `${(engStats.completed / Math.max(1, engStats.total)) * 100}%` }} />
                </div>
              </div>

              {/* Traction Distribution */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="indicator bg-[#FBBF24]" />
                    <span className="font-bold text-[#FBBF24]">Traction Distribution (TRD)</span>
                  </div>
                  <span className="text-[#94A3B8]">
                    {trdStats.completed} tasks ({Math.round(trdStats.totalMinutes / 60)} hrs)
                  </span>
                </div>
                <div className="progress-bar w-full">
                  <div className="bg-[#FBBF24] h-full" style={{ width: `${(trdStats.completed / Math.max(1, trdStats.total)) * 100}%` }} />
                </div>
              </div>

              {/* S&T */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="indicator bg-[#C084FC]" />
                    <span className="font-bold text-[#C084FC]">Signal & Telecommunication (S&T)</span>
                  </div>
                  <span className="text-[#94A3B8]">
                    {sntStats.completed} tasks ({Math.round(sntStats.totalMinutes / 60)} hrs)
                  </span>
                </div>
                <div className="progress-bar w-full">
                  <div className="bg-[#C084FC] h-full" style={{ width: `${(sntStats.completed / Math.max(1, sntStats.total)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Coordination Audit Notes */}
          <div className="bg-[#161B22] p-3.5 rounded border border-[#2A2F3A] text-xs space-y-1.5 text-[#CBD5E1]">
            <div className="flex items-center gap-1.5 font-bold text-[#38BDF8] font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Coordination Audit Findings</span>
            </div>
            <p className="leading-relaxed text-[#CBD5E1] text-[11px]">
              • Automated conflict detection resolved 2 cross-departmental contention bottlenecks without human intervention.
            </p>
            <p className="leading-relaxed text-[#CBD5E1] text-[11px]">
              • Integrated shadow maintenance windows allowed Traction OHE power shutdown to be shared with S&T and Engineering, saving an estimated 3.5 hours of corridor block time.
            </p>
            <p className="leading-relaxed text-[#CBD5E1] text-[11px]">
              • 10 out of 10 sub-blocks were maintained and handed back to train operations with zero residual safety speed restrictions.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#161B22] p-4 border-t border-[#2A2F3A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#64748B] font-mono">
            Varanasi–Ara Corridor (SIH26027)
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setShowDaySummary(false);
                jumpToTime(0);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#2A2F3A] hover:bg-[#3A3F4A] text-white text-xs font-semibold rounded transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>VIEW TIMELINE</span>
            </button>

            <button
              onClick={() => {
                setShowDaySummary(false);
                runAgain();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0B0E14] text-xs font-bold rounded transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RUN AGAIN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
