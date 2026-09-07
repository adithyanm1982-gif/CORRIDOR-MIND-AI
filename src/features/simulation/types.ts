export type DepartmentId = 'engineering' | 'traction' | 'signaling';

export type TaskStatus = 'UPCOMING' | 'IN_PROGRESS' | 'WAITING_DEPENDENCY' | 'COMPLETED' | 'CONFLICT' | 'RESCHEDULED';

export type SubBlockStatus = 'AVAILABLE' | 'SCHEDULED' | 'UNDER_MAINTENANCE' | 'COMPLETED' | 'CONFLICT' | 'RESCHEDULED';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ScheduledOperation {
  id: string;
  name: string;
  type: 'Vande Bharat' | 'Rajdhani Express' | 'Superfast Express' | 'Freight Container' | 'Passenger' | 'Special Rake';
  origin: string; // e.g. "Station 01 (Varanasi)"
  destination: string; // e.g. "Station 02 (Zamania)"
  scheduledTimeMinutes: number; // 0 to 1440
  durationMinutes: number;
  primaryTrack: 1 | 2;
  pathSubBlockIds: string[];
  alternativeTrack: 1 | 2;
  alternativePathSubBlockIds: string[];
  priorityLevel: 'CRITICAL_EXPRESS' | 'SUPERFAST' | 'FREIGHT' | 'PASSENGER';
  // State dynamically computed from simulation time and maintenance blocks
  impactStatus: 'NORMAL' | 'IMPACT_DETECTED' | 'RESOLVED_ALT_PATH' | 'RESOLVED_DELAY' | 'RESOLVED_MAINT_RESCHEDULE';
  revisedDepartureMinutes?: number;
  delayMinutes?: number;
  activeRouteUsed?: 'PRIMARY' | 'ALTERNATIVE';
  mitigationSummary?: string;
  affectedByTaskId?: string;
  affectedSubBlockId?: string;
}

export interface OperationalImpactItem {
  id: string;
  operationId: string;
  operationName: string;
  subBlockId: string;
  taskId: string;
  departmentId: DepartmentId;
  scheduledTimeMinutes: number;
  isMitigated: boolean;
  options: {
    optionA_delay: {
      delayMinutes: number;
      revisedTimeMinutes: number;
      description: string;
    };
    optionB_altTrack: {
      isAvailable: boolean;
      delayMinutes: number;
      revisedTimeMinutes: number;
      altTrackNumber: 1 | 2;
      description: string;
    };
    optionC_reschedule: {
      isAllowed: boolean;
      delayMinutes: number;
      newStartMinutes: number;
      newEndMinutes: number;
      reasonIfNotAllowed?: string;
      description: string;
    };
  };
  chosenOption: 'OPTION_A_DELAY' | 'OPTION_B_ALT_TRACK' | 'OPTION_C_RESCHEDULE';
  finalDelayMinutes: number;
  revisedTimeFormatted: string;
  summary: string;
}

export interface MaintenanceTask {
  id: string;
  departmentId: DepartmentId;
  subBlockId: string; // e.g. "SB-03"
  activity: string;
  category: string; // e.g. "Track inspection", "OHE maintenance"
  startMinutes: number; // 0 to 1440 (minutes from 00:00)
  endMinutes: number;   // 0 to 1440
  durationMinutes: number; // Duration in minutes
  status: TaskStatus;
  priority: PriorityLevel;
  crewCount: number;
  equipment: string;
  safetyProtocol: string;
  notes?: string;
  // Realistic dependencies: task cannot start until prerequisite tasks are completed
  dependencies?: string[];
  // Progress tracking (0 - 100%)
  progress?: number;
  // Conflict tracking
  isConflicted?: boolean;
  conflictWithTaskId?: string;
  originalStartMinutes?: number;
  originalSubBlockId?: string;
  resolvedNote?: string;
}

export interface DepartmentCrewState {
  departmentId: DepartmentId;
  crewName: string;
  status: 'WORKING' | 'MOVING' | 'ARRIVED' | 'WAITING_DEPENDENCY' | 'STANDBY' | 'COMPLETED';
  currentSubBlockId: string;
  targetSubBlockId?: string;
  fromSubBlockId?: string;
  transitProgressPercent?: number; // 0 to 100 during movement
  corridorPositionIndex: number;   // 0.0 to 9.0 interpolated along corridor
  activeTaskId?: string;
  activity?: string;
  progressPercent?: number;
  message: string;
  nextTaskId?: string;
  nextActivity?: string;
  nextStartTimeMinutes?: number;
  nextSubBlockId?: string;
}

export interface SubBlockData {
  id: string; // "SB-01", "SB-02", etc.
  name: string;
  chainageStartKm: number;
  chainageEndKm: number;
  trackType: string;
  oheVoltage: string;
  criticalAssets: string[];
  maxPermissibleSpeed: number; // km/h
}

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  shortName: string;
  code: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentColor: string;
  description: string;
  responsibilities: string[];
  headOfficer: string;
  crewBase: string;
}

export interface ConflictItem {
  id: string;
  subBlockId: string;
  task1: MaintenanceTask;
  task2: MaintenanceTask;
  overlapStartMinutes: number;
  overlapEndMinutes: number;
  overlapDurationMinutes: number;
  isResolved: boolean;
  suggestedResolution: {
    targetTaskId: string;
    newSubBlockId: string;
    newStartMinutes: number;
    newEndMinutes: number;
    reason: string;
  };
}

export interface ActivityLogEntry {
  id: string;
  timestampMinutes: number;
  timeFormatted: string;
  departmentId?: DepartmentId;
  subBlockId?: string;
  type: 'ENTRY' | 'START' | 'PROGRESS' | 'COMPLETION' | 'CONFLICT' | 'AI_RECOMMENDATION' | 'RESCHEDULE' | 'SYSTEM';
  message: string;
}

export interface CoordinationMetric {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  upcomingTasks: number;
  conflictsDetected: number;
  conflictsResolved: number;
  activeConflicts: number;
  totalMaintenanceMinutes: number;
  corridorUtilizationPercent: number;
  coordinationEfficiencyScore: number;
  subBlocksUtilizedCount: number;
  totalSubBlocksCount: number;
  departmentBreakdown: {
    engineering: { completed: number; total: number; totalMinutes: number };
    traction: { completed: number; total: number; totalMinutes: number };
    signaling: { completed: number; total: number; totalMinutes: number };
  };
  operationalImpactsDetected: number;
  operationalImpactsMitigated: number;
  alternativesSelected: {
    altTrack: number;
    delayed: number;
    maintRescheduled: number;
  };
  totalOperationalDelaySavedMinutes: number;
  totalOperationalDelayIncurredMinutes: number;
}
