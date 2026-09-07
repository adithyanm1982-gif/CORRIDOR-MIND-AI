import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { DEPARTMENTS, SUB_BLOCKS } from '../data/corridorData';
import { DepartmentId } from '../types';
import { X, CheckCircle2, ShieldCheck, Zap, Wrench, Radio, AlertTriangle } from 'lucide-react';

interface InfoTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoTelemetryModal: React.FC<InfoTelemetryModalProps> = ({ isOpen, onClose }) => {
  const { metrics, crewStates, operationalImpacts, activeConflict, timeFormatted } = useSimulation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#090D16] border border-[#232D3F] rounded-xl max-w-2xl w-full p-5 font-mono text-xs shadow-2xl text-[#E2E8F0] animate-fade-in max-h-[85vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2533]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
            <span className="text-white font-black text-sm uppercase tracking-wider">
              CENTRAL TRAFFIC CONTROL (CTC) • SYSTEM METRICS
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1.5 rounded hover:bg-[#151C28] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="p-3 rounded bg-[#06080E] border border-[#1E2533]">
            <span className="text-[#64748B] text-[10px] block">CORRIDOR SPAN</span>
            <span className="text-white font-bold text-sm">49.0 KM Dual Track</span>
            <span className="text-[#10B981] text-[9px] block">KM 100.0 – 149.0</span>
          </div>

          <div className="p-3 rounded bg-[#06080E] border border-[#1E2533]">
            <span className="text-[#64748B] text-[10px] block">SIMULATION TIME</span>
            <span className="text-[#38BDF8] font-bold text-sm">{timeFormatted}</span>
            <span className="text-[#64748B] text-[9px] block">24-Hour Schedule</span>
          </div>

          <div className="p-3 rounded bg-[#06080E] border border-[#1E2533]">
            <span className="text-[#64748B] text-[10px] block">EFFICIENCY SCORE</span>
            <span className="text-[#10B981] font-bold text-sm">{metrics.coordinationEfficiencyScore}%</span>
            <span className="text-[#64748B] text-[9px] block">AI Auto-Optimization</span>
          </div>

          <div className="p-3 rounded bg-[#06080E] border border-[#1E2533]">
            <span className="text-[#64748B] text-[10px] block">DELAYS SAVED</span>
            <span className="text-emerald-400 font-bold text-sm">+{metrics.totalOperationalDelaySavedMinutes}m</span>
            <span className="text-[#64748B] text-[9px] block">Dynamic Crossovers</span>
          </div>
        </div>

        {/* 3 Department Statuses */}
        <div className="mb-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
            Department Crews & Work Possession Status
          </h4>

          <div className="space-y-2">
            {(['engineering', 'traction', 'signaling'] as DepartmentId[]).map(deptId => {
              const dept = DEPARTMENTS[deptId];
              const crew = crewStates[deptId];
              const deptStats = metrics.departmentBreakdown[deptId];

              return (
                <div
                  key={deptId}
                  className="p-2.5 rounded bg-[#06080E] border border-[#1E2533] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="p-1.5 rounded"
                      style={{ backgroundColor: `${dept.color}20`, color: dept.color }}
                    >
                      {deptId === 'engineering' ? <Wrench className="w-3.5 h-3.5" /> : deptId === 'traction' ? <Zap className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
                    </span>
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span>{dept.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>
                          {dept.code}
                        </span>
                      </div>
                      <div className="text-[#94A3B8] text-[10px]">
                        Base: {dept.crewBase} • {crew.activity || 'Corridor Monitoring'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: crew.status === 'WORKING' ? `${dept.color}25` : '#131A26',
                        color: crew.status === 'WORKING' ? dept.color : '#94A3B8'
                      }}
                    >
                      {crew.status === 'WORKING' ? `WORKING (${crew.progressPercent || 0}%)` : crew.status === 'MOVING' ? 'IN TRANSIT' : 'STANDBY'}
                    </span>
                    <span className="block text-[10px] text-[#64748B] mt-0.5">
                      {deptStats.completed} / {deptStats.total} Tasks Completed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety & Crossover Interlocking */}
        <div className="p-3 rounded bg-[#06080E] border border-[#1E2533] text-[11px] text-[#94A3B8] space-y-1.5">
          <div className="text-white font-bold flex items-center justify-between">
            <span>ELECTRONIC INTERLOCKING & POINT MACHINES</span>
            <span className="text-emerald-400 font-bold">PT MOTOR // SECURED [N]</span>
          </div>
          <p>
            Universal scissors crossovers between Station 01 (Varanasi), Station 02 (Kashi), Station 03 (DDU), Station 04 (Kuchman), and Station 05 (Zamania) are locked in Normal [N] route alignment with digital track circuits and axle counters proving track clearance.
          </p>
          {activeConflict && !activeConflict.isResolved && (
            <div className="p-2 rounded bg-red-950/40 border border-red-500/50 text-red-300 flex items-center gap-2 mt-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Active contention at <strong>{activeConflict.subBlockId}</strong>: Requires corridor auto-coordination.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#1E2533] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#13283E] hover:bg-[#1A3450] text-[#38BDF8] border border-[#38BDF8]/40 font-bold transition cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
