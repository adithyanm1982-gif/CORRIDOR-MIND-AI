import React, { useState } from 'react';
import { Bell, LogOut, ChevronRight, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface HeaderProps {
  onOpenInfoModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfoModal }) => {
  const { activeConflict, operationalImpacts, metrics } = useSimulation();
  const [activeTab, setActiveTab] = useState<string>('Simulation');
  const [modalTab, setModalTab] = useState<string | null>(null);

  const navItems = [
    'Dashboard',
    'Requests',
    'Priorities',
    'Planning',
    'Schedules',
    'Conflicts & Safety',
    'Coordination',
    'Approvals',
    'Data / Assets',
    'Simulation'
  ];

  const unreadCount = (activeConflict && !activeConflict.isResolved ? 1 : 0) + operationalImpacts.length;

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'Simulation') {
      setModalTab(tab);
    } else {
      setModalTab(null);
    }
  };

  return (
    <>
      <header className="border-b border-[#1E2533] bg-[#070B13] text-[#E0E6ED] px-4 sm:px-6 py-2 select-none shrink-0 z-30 relative">
        <div className="flex items-center justify-between gap-4">
          {/* Left Brand / Logo */}
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-wider text-white font-mono uppercase">
              CORRIDORMIND AI
            </span>
          </div>

          {/* Center Navigation Tabs Matching Reference Model */}
          <nav className="hidden lg:flex items-center gap-1 font-mono text-xs overflow-x-auto py-0.5">
            {navItems.map(item => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => handleTabClick(item)}
                  className={`px-3 py-1.5 rounded transition cursor-pointer whitespace-nowrap font-medium ${
                    isActive
                      ? 'bg-[#13283E] text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(56,189,248,0.2)] font-bold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#111622]'
                  }`}
                >
                  {item}
                  {item === 'Conflicts & Safety' && activeConflict && !activeConflict.isResolved && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right User & System Status */}
          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Notification Bell */}
            <button
              onClick={() => onOpenInfoModal && onOpenInfoModal()}
              className="relative p-1.5 text-[#94A3B8] hover:text-white rounded hover:bg-[#151C28] transition cursor-pointer"
              title="System Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#070B13] animate-pulse" />
              )}
            </button>

            {/* Controller Profile Badge */}
            <div className="flex items-center gap-1.5 text-[#CBD5E1]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="font-bold text-white text-xs">VG · CONTROLLER</span>
            </div>

            {/* Logout link */}
            <span className="text-[#64748B] text-xs hidden sm:inline">
              Zone: NR / DDU
            </span>
          </div>
        </div>
      </header>

      {/* Lightweight Module Modal for non-Simulation Tabs */}
      {modalTab && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C111D] border border-[#232D3F] rounded-xl max-w-lg w-full p-5 font-mono text-xs shadow-2xl text-[#E2E8F0] animate-fade-in">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1E2533]">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm uppercase">CORRIDORMIND AI • {modalTab}</span>
                <span className="px-2 py-0.5 rounded bg-[#13283E] text-[#38BDF8] text-[10px]">Active Session</span>
              </div>
              <button
                onClick={() => setModalTab(null)}
                className="text-[#94A3B8] hover:text-white p-1 rounded hover:bg-[#1E2738] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 py-2 text-[11px] text-[#94A3B8]">
              <p>
                Connected to Centralized Traffic Control (CTC) subsystem for <span className="text-white font-semibold">{modalTab}</span>. All active corridor metrics, safety interlocks, and master schedules are synchronized with the 24-hour Simulation Engine.
              </p>

              <div className="grid grid-cols-2 gap-2 text-white">
                <div className="p-2.5 rounded bg-[#07090E] border border-[#1E2533]">
                  <span className="text-[#64748B] block text-[10px]">Total Corridors Protected</span>
                  <span className="font-bold text-sm text-[#38BDF8]">49.0 KM Dual Track</span>
                </div>
                <div className="p-2.5 rounded bg-[#07090E] border border-[#1E2533]">
                  <span className="text-[#64748B] block text-[10px]">Optimization Efficiency</span>
                  <span className="font-bold text-sm text-[#10B981]">{metrics.coordinationEfficiencyScore}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E2533] flex justify-end">
              <button
                onClick={() => {
                  setModalTab(null);
                  setActiveTab('Simulation');
                }}
                className="px-4 py-1.5 rounded bg-[#13283E] hover:bg-[#1A3450] text-[#38BDF8] border border-[#38BDF8]/40 font-bold transition cursor-pointer"
              >
                Return to Live Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
