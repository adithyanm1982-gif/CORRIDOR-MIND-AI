import React, { useState, useRef, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { SUB_BLOCKS, DEPARTMENTS } from '../data/corridorData';
import { SubBlockData, DepartmentId } from '../types';
import { minutesToTimeString } from '../utils/timeUtils';
import {
  AlertTriangle,
  Sparkles,
  X,
  Wrench,
  Zap,
  Radio,
  Clock,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ArrowRight,
  Info,
  ShieldCheck,
  Users,
  Compass
} from 'lucide-react';

interface SimulationMapProps {
  onResolveOptimization?: (message: string) => void;
  onOpenInfo?: () => void;
}

export const SimulationMap: React.FC<SimulationMapProps> = ({ onResolveOptimization, onOpenInfo }) => {
  const {
    simTimeMinutes,
    crewStates,
    getSubBlockStatus,
    activeConflict,
    resolveConflict,
    selectedSubBlockId,
    selectSubBlock,
    activeImpact,
    dismissImpact,
    tasks
  } = useSimulation();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedDeptId, setSelectedDeptId] = useState<DepartmentId | null>(null);
  const [isImpactDismissed, setIsImpactDismissed] = useState<boolean>(false);
  const [isConflictDismissed, setIsConflictDismissed] = useState<boolean>(false);

  // Reset local dismiss if new conflict or impact appears
  useEffect(() => {
    setIsConflictDismissed(false);
  }, [activeConflict?.id]);

  useEffect(() => {
    setIsImpactDismissed(false);
  }, [activeImpact?.id]);

  // Keyboard shortcut for escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectSubBlock(null);
        setSelectedDeptId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectSubBlock]);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(1.4, prev + 0.1));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.75, prev - 0.1));
  const handleResetZoom = () => setZoomLevel(1);

  // Geometric coordinates for SVG layout (viewBox="0 0 1200 440")
  // Station 01: x=20..110
  // SB-01 to SB-10: x=120..1080 (960px total, 96px per sub-block)
  // Station 02: x=1090..1180
  const SUB_BLOCK_WIDTH = 96;
  const CORRIDOR_START_X = 120;
  const getSubBlockCenterX = (index: number) => CORRIDOR_START_X + index * SUB_BLOCK_WIDTH + SUB_BLOCK_WIDTH / 2;

  // Vertical track coordinates
  const TRACK_UP_Y = 220;
  const TRACK_DOWN_Y = 265;
  const OVERHEAD_CATENARY_Y = 150;
  const TRACKSIDE_SNT_Y = 330;

  // Selected sub-block data
  const activeSubBlockData = selectedSubBlockId
    ? SUB_BLOCKS.find(sb => sb.id === selectedSubBlockId)
    : null;

  const activeSubBlockStatus = selectedSubBlockId
    ? getSubBlockStatus(selectedSubBlockId)
    : null;

  // Department configs with distinct icons and colors
  const DEPT_CONFIGS: Record<DepartmentId, {
    label: string;
    code: string;
    color: string;
    glowColor: string;
    bgBadge: string;
    borderColor: string;
    yPos: number;
    laneLabel: string;
    renderIcon: (className?: string) => React.ReactNode;
  }> = {
    engineering: {
      label: 'ENGINEERING',
      code: 'ENG / P-WAY',
      color: '#38BDF8', // Cyan
      glowColor: 'rgba(56, 189, 248, 0.45)',
      bgBadge: 'bg-[#38BDF8]/15',
      borderColor: 'border-[#38BDF8]/50',
      yPos: 242, // On Main Tracks
      laneLabel: 'Permanent Way Lane',
      renderIcon: (className = 'w-4 h-4') => <Wrench className={className} />
    },
    traction: {
      label: 'TRACTION DIST.',
      code: 'TRD / OHE',
      color: '#F59E0B', // Amber / Orange
      glowColor: 'rgba(245, 158, 11, 0.45)',
      bgBadge: 'bg-[#F59E0B]/15',
      borderColor: 'border-[#F59E0B]/50',
      yPos: OVERHEAD_CATENARY_Y, // Overhead Catenary
      laneLabel: '25kV Catenary Lane',
      renderIcon: (className = 'w-4 h-4') => <Zap className={className} />
    },
    signaling: {
      label: 'S&T DEPT',
      code: 'S&T / SIG',
      color: '#C084FC', // Purple / Violet
      glowColor: 'rgba(192, 132, 252, 0.45)',
      bgBadge: 'bg-[#C084FC]/15',
      borderColor: 'border-[#C084FC]/50',
      yPos: TRACKSIDE_SNT_Y, // Trackside & Cable
      laneLabel: 'Signaling & OFC Lane',
      renderIcon: (className = 'w-4 h-4') => <Radio className={className} />
    }
  };

  // Check which departments are working on a given sub-block
  const getDepartmentsOnSubBlock = (subBlockId: string): DepartmentId[] => {
    const list: DepartmentId[] = [];
    (['engineering', 'traction', 'signaling'] as DepartmentId[]).forEach(deptId => {
      const crew = crewStates[deptId];
      if (crew && (crew.status === 'WORKING' || crew.status === 'ARRIVED') && crew.currentSubBlockId === subBlockId) {
        list.push(deptId);
      }
    });
    return list;
  };

  return (
    <div
      ref={mapContainerRef}
      id="simulation-map-container"
      className="relative w-full h-full bg-[#050811] rounded-xl border border-[#161F30] overflow-hidden flex flex-col select-none"
    >
      {/* 1. TOP STATUS BAR: REALISTIC CORRIDOR METRICS & DEPARTMENT LEGEND */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#080D18]/90 border-b border-[#141C2C] text-xs font-mono z-20 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wider text-[11px] sm:text-xs">
            RAILWAY MAINTENANCE CORRIDOR
          </span>
          <span className="text-[#64748B] hidden md:inline">|</span>
          <span className="text-[#94A3B8] text-[11px] hidden md:inline">
            STATIC INFRASTRUCTURE · 3 DYNAMIC DEPARTMENTS
          </span>
        </div>

        {/* Dynamic 3 Departments Legend (Focus of user request) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {(['engineering', 'traction', 'signaling'] as DepartmentId[]).map(deptId => {
            const config = DEPT_CONFIGS[deptId];
            const crew = crewStates[deptId];
            const isWorking = crew?.status === 'WORKING';
            const isMoving = crew?.status === 'MOVING';
            const isSelected = selectedDeptId === deptId;

            return (
              <button
                key={deptId}
                onClick={() => setSelectedDeptId(isSelected ? null : deptId)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold border transition cursor-pointer ${
                  isSelected
                    ? `${config.bgBadge} ${config.borderColor} text-white ring-1 ring-${config.color}`
                    : 'bg-[#0B1220] border-[#1C2638] text-[#94A3B8] hover:border-[#2D3C56] hover:text-white'
                }`}
                title={`Click to inspect ${config.label}`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <span style={{ color: config.color }}>{config.label}</span>
                <span className="text-[9px] px-1 py-0.2 bg-[#050811] rounded text-[#E2E8F0] font-normal">
                  {isWorking ? (crew?.currentSubBlockId || 'ACTIVE') : isMoving ? 'TRANSIT' : 'READY'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-1.5 py-0.5 rounded bg-[#0F172A] border border-[#1E293B] text-[10px] text-[#94A3B8] hover:text-white transition cursor-pointer"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {onOpenInfo && (
            <button
              onClick={onOpenInfo}
              className="p-1 rounded bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-white transition cursor-pointer ml-1"
              title="Simulation Guidelines & Rules"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. OPERATIONAL IMPACT NOTIFICATION (COMPACT FLOATING BANNER) */}
      {/* Requirement: Compact notification toast when conflict or delay occurs, NOT a large persistent dashboard */}
      {activeConflict && !isConflictDismissed && (
        <div className="absolute top-12 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl z-30 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-[#1C0D0D]/95 border border-red-500/60 rounded-lg p-2.5 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-xs font-mono">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-200 text-xs tracking-wider uppercase">
                    Maintenance Contention Detected
                  </span>
                  <span className="px-1.5 py-0.2 bg-red-900/60 text-red-300 rounded text-[10px] font-bold">
                    {activeConflict.subBlockId}
                  </span>
                  <span className="text-red-400 text-[10px]">
                    {minutesToTimeString(activeConflict.overlapStartMinutes)} - {minutesToTimeString(activeConflict.overlapEndMinutes)}
                  </span>
                </div>
                <p className="text-[#FECDD3] text-[11px] mt-0.5 leading-snug">
                  {DEPARTMENTS[activeConflict.task1.departmentId].shortName} and{' '}
                  {DEPARTMENTS[activeConflict.task2.departmentId].shortName} have overlapping block possession on {activeConflict.subBlockId}.
                </p>
                <div className="text-[10px] text-amber-300/90 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Recommendation: {activeConflict.suggestedResolution.reason}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  resolveConflict(activeConflict.id);
                  if (onResolveOptimization) {
                    onResolveOptimization(`Resolved contention on ${activeConflict.subBlockId}`);
                  }
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] shadow transition cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Resolve</span>
              </button>
              <button
                onClick={() => setIsConflictDismissed(true)}
                className="p-1 text-[#94A3B8] hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operational Train Delay/Reroute Notification (Compact banner when an active impact occurs) */}
      {activeImpact && !activeConflict && !isImpactDismissed && (
        <div className="absolute top-12 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-2xl z-30 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-[#111827]/95 border border-sky-500/50 rounded-lg p-2.5 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-xs font-mono">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40 shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sky-200 text-xs tracking-wider uppercase">
                    Operational Routing Impact Mitigated
                  </span>
                  <span className="px-1.5 py-0.2 bg-sky-900/60 text-sky-300 rounded text-[10px] font-bold">
                    {activeImpact.operationId}
                  </span>
                </div>
                <p className="text-[#CBD5E1] text-[11px] mt-0.5 leading-snug">
                  Corridor maintenance active on {activeImpact.subBlockId}. {activeImpact.summary}
                </p>
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Calculated revised traversal: {activeImpact.revisedTimeFormatted} (+{activeImpact.finalDelayMinutes}m)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsImpactDismissed(true);
                dismissImpact();
              }}
              className="px-2 py-1 text-[#94A3B8] hover:text-white rounded hover:bg-white/10 text-[10px] transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. CENTRAL INTERACTIVE SCHEMATIC CANVAS */}
      <div className="flex-1 w-full h-full relative overflow-auto flex items-center justify-center p-2">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="transition-transform duration-150 ease-out w-full max-w-[1240px] aspect-[1200/440] min-w-[900px] relative"
        >
          <svg
            viewBox="0 0 1200 440"
            className="w-full h-full overflow-visible font-mono"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              {/* Subtle background grid pattern */}
              <pattern id="rail-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0F172A" strokeWidth="0.75" opacity="0.6" />
              </pattern>

              {/* Conflict warning diagonal stripes */}
              <pattern id="hazard-pattern" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(239, 68, 68, 0.35)" strokeWidth="6" />
                <line x1="8" y1="0" x2="8" y2="16" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="6" />
              </pattern>

              {/* Maintenance in progress glow filters */}
              <filter id="glow-eng" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-trd" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-snt" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Sleeper cross-tie pattern */}
              <pattern id="track-sleepers" width="8" height="20" patternUnits="userSpaceOnUse">
                <rect x="2" y="3" width="3" height="14" fill="#1E293B" rx="0.5" />
              </pattern>
            </defs>

            {/* Canvas Background */}
            <rect width="1200" height="440" fill="#060A14" />
            <rect width="1200" height="440" fill="url(#rail-grid)" />

            {/* Corridor Elevation & Lane Guidelines (Very subtle background context) */}
            <g opacity="0.4">
              <text x="120" y="132" fill="#64748B" fontSize="9" fontWeight="600" letterSpacing="1">
                ▲ OVERHEAD 25kV CATENARY PLANE (TRACTION DISTRIBUTION)
              </text>
              <line x1="120" y1="138" x2="1080" y2="138" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />

              <text x="120" y="200" fill="#64748B" fontSize="9" fontWeight="600" letterSpacing="1">
                ▲ MAINLINE TRACK CORRIDOR (ENGINEERING / PERMANENT WAY)
              </text>

              <text x="120" y="365" fill="#64748B" fontSize="9" fontWeight="600" letterSpacing="1">
                ▲ TRACKSIDE & SIGNALING PLANE (SIGNAL & TELECOM)
              </text>
              <line x1="120" y1="352" x2="1080" y2="352" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
            </g>

            {/* ========================================================= */}
            {/* SUB-BLOCK CORRIDOR SEGMENTS (SB-01 to SB-10)               */}
            {/* ========================================================= */}
            {SUB_BLOCKS.map((sb, idx) => {
              const startX = CORRIDOR_START_X + idx * SUB_BLOCK_WIDTH;
              const statusInfo = getSubBlockStatus(sb.id);
              const deptsHere = getDepartmentsOnSubBlock(sb.id);
              const isSelected = selectedSubBlockId === sb.id;
              const isConflicted = statusInfo.hasConflict;
              const isUnderMaint = statusInfo.status === 'UNDER_MAINTENANCE' || deptsHere.length > 0;

              // Determine sub-block accent styling
              let blockBg = 'rgba(15, 23, 42, 0.25)';
              let borderColor = '#1E293B';
              let badgeColor = '#64748B';

              if (isConflicted) {
                blockBg = 'url(#hazard-pattern)';
                borderColor = '#EF4444';
                badgeColor = '#EF4444';
              } else if (isUnderMaint) {
                if (deptsHere.includes('engineering')) {
                  blockBg = 'rgba(56, 189, 248, 0.08)';
                  borderColor = 'rgba(56, 189, 248, 0.4)';
                  badgeColor = '#38BDF8';
                } else if (deptsHere.includes('traction')) {
                  blockBg = 'rgba(245, 158, 11, 0.08)';
                  borderColor = 'rgba(245, 158, 11, 0.4)';
                  badgeColor = '#F59E0B';
                } else if (deptsHere.includes('signaling')) {
                  blockBg = 'rgba(192, 132, 252, 0.08)';
                  borderColor = 'rgba(192, 132, 252, 0.4)';
                  badgeColor = '#C084FC';
                }
              }

              if (isSelected) {
                borderColor = '#38BDF8';
              }

              return (
                <g
                  key={sb.id}
                  id={`subblock-group-${sb.id}`}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => selectSubBlock(isSelected ? null : sb.id)}
                >
                  {/* Background Pillar for this Sub-block */}
                  <rect
                    x={startX + 2}
                    y={50}
                    width={SUB_BLOCK_WIDTH - 4}
                    height={335}
                    rx={6}
                    fill={blockBg}
                    stroke={borderColor}
                    strokeWidth={isSelected ? 2 : isConflicted ? 1.5 : 1}
                    strokeDasharray={isUnderMaint || isConflicted || isSelected ? 'none' : '3 3'}
                    className="hover:fill-slate-800/40 transition-colors"
                  />

                  {/* Sub-block Top Header Badge */}
                  <g transform={`translate(${startX + SUB_BLOCK_WIDTH / 2}, 70)`}>
                    <rect
                      x={-34}
                      y={-12}
                      width={68}
                      height={20}
                      rx={4}
                      fill="#0B1220"
                      stroke={borderColor}
                      strokeWidth={1}
                    />
                    <text
                      x={0}
                      y={2}
                      textAnchor="middle"
                      fill={isConflicted ? '#F87171' : isUnderMaint ? badgeColor : '#E2E8F0'}
                      fontSize="10"
                      fontWeight="700"
                    >
                      {sb.id}
                    </text>
                  </g>

                  {/* Km Range Label */}
                  <text
                    x={startX + SUB_BLOCK_WIDTH / 2}
                    y={92}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="8"
                    fontWeight="500"
                  >
                    {sb.chainageStartKm.toFixed(1)}–{sb.chainageEndKm.toFixed(1)} km
                  </text>

                  {/* Sub-block Status indicator badge */}
                  {isConflicted ? (
                    <g transform={`translate(${startX + SUB_BLOCK_WIDTH / 2}, 108)`}>
                      <rect x={-36} y={-8} width={72} height={16} rx={3} fill="#7F1D1D" stroke="#EF4444" strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill="#FECDD3" fontSize="8" fontWeight="800">
                        ⚠ CONFLICT
                      </text>
                    </g>
                  ) : isUnderMaint ? (
                    <g transform={`translate(${startX + SUB_BLOCK_WIDTH / 2}, 108)`}>
                      <rect x={-36} y={-8} width={72} height={16} rx={3} fill="#0C1A2E" stroke={badgeColor} strokeWidth={1} />
                      <text x={0} y={3} textAnchor="middle" fill={badgeColor} fontSize="8" fontWeight="700">
                        ● OCCUPIED
                      </text>
                    </g>
                  ) : (
                    <text
                      x={startX + SUB_BLOCK_WIDTH / 2}
                      y={110}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="8"
                      fontWeight="500"
                    >
                      CLEAR
                    </text>
                  )}
                </g>
              );
            })}

            {/* ========================================================= */}
            {/* STATIC RAILWAY INFRASTRUCTURE (CLEAN BACKGROUND)          */}
            {/* NO TRAINS, NO SIGNALS, JUST CLEAN HORIZONTAL TRACKS       */}
            {/* ========================================================= */}

            {/* Catenary Mast line */}
            <line x1="80" y1={OVERHEAD_CATENARY_Y} x2="1120" y2={OVERHEAD_CATENARY_Y} stroke="#1E293B" strokeWidth="1.5" />
            {Array.from({ length: 19 }).map((_, i) => {
              const mastX = 120 + i * 50;
              return (
                <g key={`mast-${i}`} opacity="0.5">
                  <line x1={mastX} y1={OVERHEAD_CATENARY_Y - 8} x2={mastX} y2={OVERHEAD_CATENARY_Y + 8} stroke="#334155" strokeWidth="1.5" />
                  <circle cx={mastX} cy={OVERHEAD_CATENARY_Y} r="1.5" fill="#64748B" />
                </g>
              );
            })}

            {/* TRACK 1 (UP Mainline) */}
            <g id="track-1-group">
              {/* Ballast foundation */}
              <rect x="70" y={TRACK_UP_Y - 10} width="1060" height="20" fill="#0A0F1D" rx="2" />
              {/* Sleepers */}
              <line
                x1="80"
                y1={TRACK_UP_Y}
                x2="1120"
                y2={TRACK_UP_Y}
                stroke="#1E293B"
                strokeWidth="14"
                strokeDasharray="2 6"
              />
              {/* Running rails (pair) */}
              <line x1="80" y1={TRACK_UP_Y - 4} x2="1120" y2={TRACK_UP_Y - 4} stroke="#475569" strokeWidth="1.75" />
              <line x1="80" y1={TRACK_UP_Y + 4} x2="1120" y2={TRACK_UP_Y + 4} stroke="#475569" strokeWidth="1.75" />

              {/* Track Label */}
              <text x="60" y={TRACK_UP_Y + 3} fill="#64748B" fontSize="8" fontWeight="700" textAnchor="end">
                UP LINE (T-1)
              </text>
            </g>

            {/* TRACK 2 (DOWN Mainline) */}
            <g id="track-2-group">
              {/* Ballast foundation */}
              <rect x="70" y={TRACK_DOWN_Y - 10} width="1060" height="20" fill="#0A0F1D" rx="2" />
              {/* Sleepers */}
              <line
                x1="80"
                y1={TRACK_DOWN_Y}
                x2="1120"
                y2={TRACK_DOWN_Y}
                stroke="#1E293B"
                strokeWidth="14"
                strokeDasharray="2 6"
              />
              {/* Running rails (pair) */}
              <line x1="80" y1={TRACK_DOWN_Y - 4} x2="1120" y2={TRACK_DOWN_Y - 4} stroke="#475569" strokeWidth="1.75" />
              <line x1="80" y1={TRACK_DOWN_Y + 4} x2="1120" y2={TRACK_DOWN_Y + 4} stroke="#475569" strokeWidth="1.75" />

              {/* Track Label */}
              <text x="60" y={TRACK_DOWN_Y + 3} fill="#64748B" fontSize="8" fontWeight="700" textAnchor="end">
                DN LINE (T-2)
              </text>
            </g>

            {/* Crossover Points (Scissors geometry at SB-05 and SB-08) */}
            <g id="crossovers-group" opacity="0.6">
              {/* Crossover 1 at SB-05 */}
              <line x1="535" y1={TRACK_UP_Y + 4} x2="570" y2={TRACK_DOWN_Y - 4} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="570" y1={TRACK_UP_Y + 4} x2="535" y2={TRACK_DOWN_Y - 4} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
              {/* Crossover 2 at SB-08 */}
              <line x1="825" y1={TRACK_UP_Y + 4} x2="860" y2={TRACK_DOWN_Y - 4} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
              <line x1="860" y1={TRACK_UP_Y + 4} x2="825" y2={TRACK_DOWN_Y - 4} stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>

            {/* S&T Optical Fiber Cable Trench line */}
            <g id="snt-cable-trench" opacity="0.5">
              <line x1="80" y1={TRACKSIDE_SNT_Y} x2="1120" y2={TRACKSIDE_SNT_Y} stroke="#334155" strokeWidth="1.25" strokeDasharray="6 4" />
              <text x="60" y={TRACKSIDE_SNT_Y + 3} fill="#64748B" fontSize="8" fontWeight="700" textAnchor="end">
                OFC / SIG
              </text>
            </g>

            {/* ========================================================= */}
            {/* STATIC STATIONS: STATION 01 (LEFT) & STATION 02 (RIGHT)   */}
            {/* ========================================================= */}

            {/* STATION 01 (LEFT) */}
            <g id="station-01" transform="translate(45, 175)">
              <rect x="-30" y="-30" width="60" height="140" rx="8" fill="#0B1222" stroke="#1E293B" strokeWidth="1.5" />
              <rect x="-24" y="-24" width="48" height="24" rx="4" fill="#111C33" stroke="#38BDF8" strokeWidth="1" />
              <text x="0" y="-10" fill="#38BDF8" fontSize="9" fontWeight="800" textAnchor="middle">
                STN 01
              </text>
              <text x="0" y="-2" fill="#94A3B8" fontSize="7" fontWeight="600" textAnchor="middle">
                ORIGIN
              </text>

              {/* Station Platforms schematic */}
              <line x1="-18" y1="35" x2="20" y2="35" stroke="#334155" strokeWidth="4" />
              <text x="-12" y="32" fill="#94A3B8" fontSize="7">P-1</text>
              <line x1="-18" y1="80" x2="20" y2="80" stroke="#334155" strokeWidth="4" />
              <text x="-12" y="77" fill="#94A3B8" fontSize="7">P-2</text>

              <text x="0" y="100" fill="#64748B" fontSize="7" textAnchor="middle">
                0.0 KM
              </text>
            </g>

            {/* STATION 02 (RIGHT) */}
            <g id="station-02" transform="translate(1145, 175)">
              <rect x="-30" y="-30" width="60" height="140" rx="8" fill="#0B1222" stroke="#1E293B" strokeWidth="1.5" />
              <rect x="-24" y="-24" width="48" height="24" rx="4" fill="#111C33" stroke="#38BDF8" strokeWidth="1" />
              <text x="0" y="-10" fill="#38BDF8" fontSize="9" fontWeight="800" textAnchor="middle">
                STN 02
              </text>
              <text x="0" y="-2" fill="#94A3B8" fontSize="7" fontWeight="600" textAnchor="middle">
                TERMINUS
              </text>

              {/* Station Platforms schematic */}
              <line x1="-20" y1="35" x2="18" y2="35" stroke="#334155" strokeWidth="4" />
              <text x="-12" y="32" fill="#94A3B8" fontSize="7">P-1</text>
              <line x1="-20" y1="80" x2="18" y2="80" stroke="#334155" strokeWidth="4" />
              <text x="-12" y="77" fill="#94A3B8" fontSize="7">P-2</text>

              <text x="0" y="100" fill="#64748B" fontSize="7" textAnchor="middle">
                49.0 KM
              </text>
            </g>

            {/* ========================================================= */}
            {/* DYNAMIC FOCUS: THE THREE MAINTENANCE DEPARTMENTS          */}
            {/* ONLY THESE THREE ENTITIES MOVE AND ANIMATE                */}
            {/* ========================================================= */}

            {(['engineering', 'traction', 'signaling'] as DepartmentId[]).map(deptId => {
              const crew = crewStates[deptId];
              const config = DEPT_CONFIGS[deptId];
              if (!crew) return null;

              // Compute dynamic X position:
              // corridorPositionIndex is a float between 0 and 9
              const posIdx = Math.max(0, Math.min(9, crew.corridorPositionIndex));
              const currentX = getSubBlockCenterX(posIdx);
              const currentY = config.yPos;

              const isWorking = crew.status === 'WORKING';
              const isMoving = crew.status === 'MOVING';
              const isWaiting = crew.status === 'WAITING_DEPENDENCY';
              const isSelected = selectedDeptId === deptId;
              const progress = crew.progressPercent || 0;

              return (
                <g
                  key={`marker-${deptId}`}
                  id={`department-marker-${deptId}`}
                  className="cursor-pointer transition-transform duration-300 ease-out"
                  transform={`translate(${currentX}, ${currentY})`}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedDeptId(isSelected ? null : deptId);
                    if (crew.currentSubBlockId) {
                      selectSubBlock(crew.currentSubBlockId);
                    }
                  }}
                >
                  {/* Motion Trail when Moving */}
                  {isMoving && (
                    <g opacity="0.6">
                      <line
                        x1={crew.targetSubBlockId && crew.fromSubBlockId && SUB_BLOCKS.findIndex(b => b.id === crew.targetSubBlockId) < SUB_BLOCKS.findIndex(b => b.id === crew.fromSubBlockId) ? 30 : -30}
                        y1="0"
                        x2="0"
                        y2="0"
                        stroke={config.color}
                        strokeWidth="3"
                        strokeDasharray="4 4"
                      />
                    </g>
                  )}

                  {/* Active Pulsing Work Ring Animation when working */}
                  {isWorking && (
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="none"
                      stroke={config.color}
                      strokeWidth="1.5"
                      opacity="0.4"
                      className="animate-ping"
                      style={{ animationDuration: '2.5s' }}
                    />
                  )}

                  {/* Outer Glow Halo */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? '20' : '16'}
                    fill={config.glowColor}
                    stroke={config.color}
                    strokeWidth={isSelected ? '2.5' : '1.75'}
                  />

                  {/* Inner Dark Badge Base */}
                  <circle cx="0" cy="0" r={isSelected ? '16' : '13'} fill="#070C18" />

                  {/* Department Glyph in Center */}
                  <g transform="translate(-7, -7)">
                    {deptId === 'engineering' && (
                      <path
                        d="M 11.5 2.5 L 13.5 4.5 L 5 13 L 2 13 L 2 10 Z"
                        fill={config.color}
                      />
                    )}
                    {deptId === 'traction' && (
                      <path
                        d="M 8 1 L 3 8 L 7 8 L 6 13 L 11 6 L 7 6 Z"
                        fill={config.color}
                      />
                    )}
                    {deptId === 'signaling' && (
                      <path
                        d="M 7 1 A 6 6 0 0 1 7 13 M 7 3 A 4 4 0 0 1 7 11 M 7 5 A 2 2 0 0 1 7 9 M 7 7 L 7 7.01"
                        stroke={config.color}
                        strokeWidth="1.5"
                        fill="none"
                      />
                    )}
                  </g>

                  {/* Department Dynamic Information Tag & Activity Chip */}
                  <g transform={`translate(0, ${deptId === 'traction' ? -26 : 28})`}>
                    {/* Activity Pill Base */}
                    <rect
                      x="-70"
                      y="-11"
                      width="140"
                      height="22"
                      rx="5"
                      fill="#0B1324"
                      stroke={config.color}
                      strokeWidth={isSelected ? 1.5 : 1}
                      filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
                    />

                    {/* Department Code & Current Activity Text */}
                    <text
                      x="0"
                      y="-1"
                      textAnchor="middle"
                      fill={config.color}
                      fontSize="8.5"
                      fontWeight="800"
                    >
                      {config.label}
                    </text>

                    <text
                      x="0"
                      y="7.5"
                      textAnchor="middle"
                      fill="#E2E8F0"
                      fontSize="7.5"
                      fontWeight="600"
                    >
                      {isWorking
                        ? `${(crew.activity ?? '').length > 20 ? (crew.activity ?? '').substring(0, 18) + '…' : crew.activity ?? ''} (${progress}%)`
                        : isMoving
                        ? `Transit ➔ ${crew.targetSubBlockId} (${crew.transitProgressPercent}%)`
                        : isWaiting
                        ? 'Awaiting Track Clearance'
                        : 'Standby / Ready'}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 4. COMPACT FLOATING INSPECTION PANEL (POPOVER / DRAWER) */}
      {/* Requirement: Clicking or hovering department or sub-block displays compact popup */}

      {/* A. DEPARTMENT DETAIL POPOVER */}
      {selectedDeptId && (
        <div className="absolute bottom-4 right-4 z-30 w-80 sm:w-96 bg-[#090F1C]/95 border border-[#1E2B42] rounded-xl p-3.5 shadow-2xl backdrop-blur-md font-mono text-xs animate-in fade-in slide-in-from-bottom-2">
          {(() => {
            const crew = crewStates[selectedDeptId];
            const config = DEPT_CONFIGS[selectedDeptId];
            const activeTask = tasks.find(t => t.id === crew?.activeTaskId);

            return (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#1A253A]">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border"
                      style={{
                        backgroundColor: `${config.color}20`,
                        borderColor: config.color,
                        color: config.color
                      }}
                    >
                      {config.renderIcon('w-4 h-4')}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs tracking-wide">
                        {config.label}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {config.code} · {config.laneLabel}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDeptId(null)}
                    className="p-1 text-[#64748B] hover:text-white rounded hover:bg-[#1E293B] transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status & Location */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#0D1527] p-2 rounded border border-[#1C263B]">
                    <span className="text-[#64748B] block text-[9px] uppercase">Current Sub-Block</span>
                    <span className="font-bold text-white text-xs">
                      {crew?.status === 'MOVING'
                        ? `${crew.fromSubBlockId} ➔ ${crew.targetSubBlockId}`
                        : crew?.currentSubBlockId || 'Station 01 Base'}
                    </span>
                  </div>
                  <div className="bg-[#0D1527] p-2 rounded border border-[#1C263B]">
                    <span className="text-[#64748B] block text-[9px] uppercase">Status</span>
                    <span
                      className="font-bold text-xs"
                      style={{ color: config.color }}
                    >
                      {crew?.status === 'WORKING'
                        ? 'WORKING ON-SITE'
                        : crew?.status === 'MOVING'
                        ? 'EN ROUTE / TRANSIT'
                        : 'READY / STANDBY'}
                    </span>
                  </div>
                </div>

                {/* Active Activity Details */}
                <div className="bg-[#0D1527] p-2.5 rounded border border-[#1C263B] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[9px] uppercase font-bold">Current Activity</span>
                    <span className="text-white font-bold text-xs">
                      {crew?.progressPercent || 0}% Complete
                    </span>
                  </div>
                  <div className="text-white font-bold text-xs">
                    {crew?.activity || 'Standby for Scheduled Block'}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-[#151E30] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${crew?.progressPercent || 0}%`,
                        backgroundColor: config.color
                      }}
                    />
                  </div>

                  {activeTask && (
                    <div className="pt-1 text-[10px] text-[#94A3B8] space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Time Window:</span>
                        <span className="text-white font-bold">
                          {minutesToTimeString(activeTask.startMinutes)} – {minutesToTimeString(activeTask.endMinutes)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Crew Deployed:</span>
                        <span className="text-white font-bold">{activeTask.crewCount} personnel</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="shrink-0">Equipment:</span>
                        <span className="text-white text-right truncate">{activeTask.equipment}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex items-center justify-between pt-1">
                  {crew?.currentSubBlockId && (
                    <button
                      onClick={() => selectSubBlock(crew.currentSubBlockId)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold"
                    >
                      <span>Inspect Sub-Block {crew.currentSubBlockId}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDeptId(null)}
                    className="text-[10px] text-[#64748B] hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* B. SUB-BLOCK DETAIL DRAWER */}
      {selectedSubBlockId && !selectedDeptId && activeSubBlockData && (
        <div className="absolute bottom-4 left-4 z-30 w-80 sm:w-96 bg-[#090F1C]/95 border border-[#1E2B42] rounded-xl p-3.5 shadow-2xl backdrop-blur-md font-mono text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1A253A]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold text-xs border border-sky-800/50">
                    {activeSubBlockData.id}
                  </span>
                  <span className="font-bold text-white text-xs">
                    {activeSubBlockData.name}
                  </span>
                </div>
                <span className="text-[10px] text-[#64748B] block mt-0.5">
                  Chainage: {activeSubBlockData.chainageStartKm.toFixed(1)} km to {activeSubBlockData.chainageEndKm.toFixed(1)} km
                </span>
              </div>
              <button
                onClick={() => selectSubBlock(null)}
                className="p-1 text-[#64748B] hover:text-white rounded hover:bg-[#1E293B] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Occupancy Status */}
            <div className="bg-[#0D1527] p-2 rounded border border-[#1C263B]">
              <span className="text-[#64748B] text-[9px] uppercase font-bold block mb-1">
                Active Departments On-Site
              </span>
              {getDepartmentsOnSubBlock(activeSubBlockData.id).length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {getDepartmentsOnSubBlock(activeSubBlockData.id).map(deptId => {
                    const cfg = DEPT_CONFIGS[deptId];
                    const crew = crewStates[deptId];
                    return (
                      <span
                        key={deptId}
                        className="px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1"
                        style={{
                          backgroundColor: `${cfg.color}15`,
                          borderColor: `${cfg.color}40`,
                          color: cfg.color
                        }}
                      >
                        {cfg.renderIcon('w-3 h-3')}
                        <span>{cfg.label}: {crew?.activity}</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sub-block clear · Available for operations</span>
                </span>
              )}
            </div>

            {/* Critical Assets */}
            <div className="text-[10px] text-[#94A3B8]">
              <span className="text-[#64748B] font-bold block mb-0.5 uppercase">Track & Infrastructure Assets:</span>
              <div className="flex flex-wrap gap-1">
                {activeSubBlockData.criticalAssets.map((asset, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-[#0A101D] rounded border border-[#182338] text-[10px]">
                    {asset}
                  </span>
                ))}
              </div>
            </div>

            {/* Scheduled Maintenance Today */}
            <div className="bg-[#0D1527] p-2 rounded border border-[#1C263B] text-[10px]">
              <span className="text-[#64748B] font-bold block mb-1 uppercase">Today's Maintenance Schedule:</span>
              {tasks.filter(t => t.subBlockId === activeSubBlockData.id).length > 0 ? (
                <div className="space-y-1">
                  {tasks
                    .filter(t => t.subBlockId === activeSubBlockData.id)
                    .map(t => {
                      const cfg = DEPT_CONFIGS[t.departmentId];
                      return (
                        <div key={t.id} className="flex items-center justify-between text-[10px]">
                          <span style={{ color: cfg.color }} className="font-bold">
                            {cfg.code.split('/')[0]}
                          </span>
                          <span className="text-white truncate max-w-[150px]">{t.activity}</span>
                          <span className="text-[#94A3B8] font-mono">
                            {minutesToTimeString(t.startMinutes)}–{minutesToTimeString(t.endMinutes)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <span className="text-[#64748B] italic">No further blocks scheduled today.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
