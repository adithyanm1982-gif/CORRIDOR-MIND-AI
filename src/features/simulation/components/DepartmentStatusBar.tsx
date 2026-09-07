import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { DEPARTMENTS } from '../data/corridorData';
import { DepartmentId } from '../types';
import { Wrench, Zap, Radio } from 'lucide-react';

export const DepartmentStatusBar: React.FC = () => {
  const { crewStates, selectSubBlock } = useSimulation();

  const deptList: { id: DepartmentId; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'engineering',
      label: 'ENGINEERING',
      icon: <Wrench className="w-3.5 h-3.5 text-[#38BDF8]" />,
      color: '#38BDF8'
    },
    {
      id: 'traction',
      label: 'TRACTION',
      icon: <Zap className="w-3.5 h-3.5 text-[#FBBF24]" />,
      color: '#FBBF24'
    },
    {
      id: 'signaling',
      label: 'S&T',
      icon: <Radio className="w-3.5 h-3.5 text-[#C084FC]" />,
      color: '#C084FC'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 select-none shrink-0">
      {deptList.map(dept => {
        const crew = crewStates[dept.id];
        const isWorking = crew?.status === 'WORKING';
        const isMoving = crew?.status === 'MOVING';
        const subBlock = isMoving
          ? `${crew.currentSubBlockId || 'SB-01'} ➔ ${crew.targetSubBlockId}`
          : (crew?.currentSubBlockId || 'SB-01');
        const activity = crew?.activity || (isMoving ? 'En Route to Work Zone' : 'Standby / Pre-inspection');
        const progress = isMoving
          ? (crew?.transitProgressPercent || 0)
          : (crew?.progressPercent || 0);

        return (
          <div
            key={dept.id}
            onClick={() => {
              if (crew?.currentSubBlockId) {
                selectSubBlock(crew.currentSubBlockId);
              }
            }}
            className="bg-[#0E121A] border border-[#232936] rounded-md p-2.5 flex items-center justify-between hover:border-[#38BDF8]/40 transition cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Department Color Dot / Icon */}
              <div
                className="w-7 h-7 rounded flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${dept.color}15`,
                  borderColor: `${dept.color}40`
                }}
              >
                {dept.icon}
              </div>

              {/* Department & Sub-Block Name */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[11px] font-black tracking-wider" style={{ color: dept.color }}>
                    {dept.label}
                  </span>
                  <span className="text-[11px] font-bold text-white bg-[#07090E] px-1.5 py-0.2 rounded border border-[#232936]">
                    {subBlock}
                  </span>
                </div>
                <div className="text-[11px] text-[#94A3B8] font-mono truncate max-w-[180px] sm:max-w-[220px]" title={activity}>
                  {activity}
                </div>
              </div>
            </div>

            {/* Progress Percentage & Status */}
            <div className="text-right shrink-0 pl-2">
              <div className="text-xs sm:text-sm font-mono font-bold text-white">
                {progress}%
              </div>
              <div className="text-[9px] font-mono text-[#64748B]">
                {isWorking ? 'Working' : isMoving ? 'Transit' : 'Ready'}
              </div>
              {/* Mini progress bar */}
              <div className="w-12 h-1 bg-[#1A202C] rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: dept.color
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
