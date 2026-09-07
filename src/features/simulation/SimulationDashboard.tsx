import { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { Header } from './components/Header';
import { SimulationControlBar } from './components/SimulationControlBar';
import { SimulationMap } from './components/SimulationMap';
import { DepartmentStatusBar } from './components/DepartmentStatusBar';
import { InfoTelemetryModal } from './components/InfoTelemetryModal';
import { DaySummaryModal } from './components/DaySummaryModal';
import './simulation.css';

/**
 * Ported wholesale from a separate standalone simulation project the
 * user built and confirmed is exactly right -- logic and components
 * are unchanged from the original. The only adaptation made here is
 * `h-screen` -> `h-full`: the original was a full standalone app
 * (its own index.html, own viewport), this version mounts inside
 * CorridorMind AI's existing /simulation route, which already
 * constrains it to the available window area (see AppLayout.tsx's
 * `flex-1 overflow-hidden` for that route) -- h-screen would have
 * measured against the whole browser window instead of just this
 * route's content area, which is what "should fit inside the
 * Simulation Window" actually requires.
 *
 * Everything else -- SimulationProvider, SimulationMap,
 * DepartmentStatusBar drawer, SimulationControlBar, both modals -- is
 * the original composition, unchanged.
 */
function SimulationDashboardInner() {
  const [optimizationToast, setOptimizationToast] = useState<string | null>(null);
  const [showDepartmentBar, setShowDepartmentBar] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const handleOptimization = (message: string) => {
    setOptimizationToast(message);
    setTimeout(() => {
      setOptimizationToast(null);
    }, 4500);
  };

  return (
    <div className="h-full w-full bg-[#04070D] text-[#E0E6ED] flex flex-col font-sans overflow-hidden select-none">
      <Header onOpenInfoModal={() => setShowInfoModal(true)} />

      <main className="flex-1 relative w-full h-full overflow-hidden flex flex-col p-1.5 sm:p-2.5">
        <SimulationMap onResolveOptimization={handleOptimization} onOpenInfo={() => setShowInfoModal(true)} />

        {showDepartmentBar && (
          <div className="absolute bottom-2 left-2 right-2 z-40 p-2 rounded-lg bg-[#070B14]/95 border border-[#1E2533] shadow-2xl backdrop-blur-md animate-fade-in">
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#1A2234] text-[10px] font-mono text-[#94A3B8]">
              <span className="font-bold text-white uppercase">Active Department Work Crews</span>
              <button onClick={() => setShowDepartmentBar(false)} className="text-[#64748B] hover:text-white transition cursor-pointer">
                ✕ Close
              </button>
            </div>
            <DepartmentStatusBar />
          </div>
        )}
      </main>

      <SimulationControlBar
        optimizationToast={optimizationToast}
        showDepartmentBar={showDepartmentBar}
        onToggleDepartmentBar={() => setShowDepartmentBar(!showDepartmentBar)}
      />

      <InfoTelemetryModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />

      <DaySummaryModal />
    </div>
  );
}

export function SimulationDashboard() {
  return (
    <SimulationProvider>
      <SimulationDashboardInner />
    </SimulationProvider>
  );
}
