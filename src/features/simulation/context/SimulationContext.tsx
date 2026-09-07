import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  DepartmentId,
  MaintenanceTask,
  ConflictItem,
  ActivityLogEntry,
  CoordinationMetric,
  SubBlockStatus,
  DepartmentCrewState,
  ScheduledOperation,
  OperationalImpactItem
} from '../types';
import {
  INITIAL_TASKS,
  INITIAL_ACTIVITY_LOGS,
  SUB_BLOCKS,
  DEPARTMENTS,
  INITIAL_OPERATIONS
} from '../data/corridorData';
import { minutesToTimeString, calculateProgress } from '../utils/timeUtils';

interface SimulationContextType {
  simTimeMinutes: number;
  timeFormatted: string;
  isRunning: boolean;
  speed: number;
  tasks: MaintenanceTask[];
  conflicts: ConflictItem[];
  activityLogs: ActivityLogEntry[];
  selectedSubBlockId: string | null;
  selectedTaskId: string | null;
  showSubBlockModal: boolean;
  showDaySummary: boolean;
  showReportModal: boolean;
  activeConflict: ConflictItem | null;
  metrics: CoordinationMetric;
  crewStates: Record<DepartmentId, DepartmentCrewState>;
  operations: ScheduledOperation[];
  operationalImpacts: OperationalImpactItem[];
  activeImpact: OperationalImpactItem | null;
  
  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  runAgain: () => void;
  setSpeed: (speed: number) => void;
  jumpToTime: (minutes: number) => void;
  selectSubBlock: (subBlockId: string | null) => void;
  openSubBlockModal: (subBlockId: string) => void;
  closeSubBlockModal: () => void;
  selectTask: (taskId: string | null) => void;
  setShowDaySummary: (show: boolean) => void;
  setShowReportModal: (show: boolean) => void;
  resolveConflict: (conflictId: string) => void;
  triggerDemoConflict: () => void;
  triggerDemoImpact: () => void;
  dismissImpact: () => void;
  getSubBlockStatus: (subBlockId: string) => {
    status: SubBlockStatus;
    activeTasks: MaintenanceTask[];
    upcomingTasks: MaintenanceTask[];
    completedTasks: MaintenanceTask[];
    hasConflict: boolean;
  };
}

const SimulationContext = createContext<SimulationContextType | null>(null);

function detectInitialConflicts(): ConflictItem[] {
  const detected: ConflictItem[] = [];
  for (let i = 0; i < INITIAL_TASKS.length; i++) {
    for (let j = i + 1; j < INITIAL_TASKS.length; j++) {
      const t1 = INITIAL_TASKS[i];
      const t2 = INITIAL_TASKS[j];

      if (t1.subBlockId === t2.subBlockId && t1.departmentId !== t2.departmentId) {
        const overlapStart = Math.max(t1.startMinutes, t2.startMinutes);
        const overlapEnd = Math.min(t1.endMinutes, t2.endMinutes);

        if (overlapStart < overlapEnd) {
          detected.push({
            id: `conflict-${t1.id}-${t2.id}`,
            subBlockId: t1.subBlockId,
            task1: t1,
            task2: t2,
            overlapStartMinutes: overlapStart,
            overlapEndMinutes: overlapEnd,
            overlapDurationMinutes: overlapEnd - overlapStart,
            isResolved: false,
            suggestedResolution: {
              targetTaskId: t2.id,
              newSubBlockId: t1.subBlockId,
              newStartMinutes: Math.min(1380, t1.endMinutes),
              newEndMinutes: Math.min(1440, t1.endMinutes + (t2.endMinutes - t2.startMinutes)),
              reason: `Reschedule ${DEPARTMENTS[t2.departmentId].name} to ${minutesToTimeString(t1.endMinutes)} on ${t1.subBlockId} after ${DEPARTMENTS[t1.departmentId].name} releases track possession.`
            }
          });
        }
      }
    }
  }
  return detected;
}

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simulation Clock state (0 to 1440 minutes)
  const [simTimeMinutes, setSimTimeMinutes] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeedState] = useState<number>(2); // Default 2x speed for responsive demo

  // Tasks state (allows rescheduling/modifying on conflict resolution)
  const [tasks, setTasks] = useState<MaintenanceTask[]>(() => JSON.parse(JSON.stringify(INITIAL_TASKS)));
  
  // Activity Log
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>(INITIAL_ACTIVITY_LOGS);
  
  // UI selection states
  const [selectedSubBlockId, setSelectedSubBlockId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSubBlockModal, setShowSubBlockModal] = useState<boolean>(false);
  const [showDaySummary, setShowDaySummary] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  
  // Keep track of milestones already logged to avoid repeated log entries on small ticks
  const loggedMilestonesRef = useRef<Set<string>>(new Set(['init-0', 'init-1', 'init-2']));

  // Persistent conflicts registry across simulation lifecycle
  const [conflictList, setConflictList] = useState<ConflictItem[]>(() => detectInitialConflicts());

  // Scheduled Train Operations state (runs as background data without visual train icons)
  const [operations, setOperations] = useState<ScheduledOperation[]>(() => JSON.parse(JSON.stringify(INITIAL_OPERATIONS)));
  const [dismissedImpactId, setDismissedImpactId] = useState<string | null>(null);

  // Helper to add activity log entry
  const addLog = useCallback((
    type: ActivityLogEntry['type'],
    message: string,
    departmentId?: DepartmentId,
    subBlockId?: string,
    customMinutes?: number
  ) => {
    const mins = customMinutes !== undefined ? customMinutes : simTimeMinutes;
    const newEntry: ActivityLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestampMinutes: mins,
      timeFormatted: minutesToTimeString(mins),
      departmentId,
      subBlockId,
      type,
      message
    };
    setActivityLogs(prev => [newEntry, ...prev.slice(0, 199)]); // Keep latest 200 logs
  }, [simTimeMinutes]);

  // Conflicts exposed to components (with updated task references)
  const conflicts = conflictList;

  // Active conflict that is currently unresolved during or approaching current sim time window
  const activeConflict = useMemo(() => {
    return conflicts.find(c => 
      !c.isResolved && 
      simTimeMinutes >= c.overlapStartMinutes - 45 && // Alert 45 mins ahead
      simTimeMinutes <= c.overlapEndMinutes + 15      // Through overlap window
    ) || null;
  }, [conflicts, simTimeMinutes]);

  // Update task statuses dynamically based on current simTime and realistic dependencies
  const evaluatedTasks = useMemo(() => {
    const completedTaskIds = new Set<string>();
    tasks.forEach(t => {
      if (simTimeMinutes >= t.endMinutes) {
        completedTaskIds.add(t.id);
      }
    });

    return tasks.map(task => {
      let status: MaintenanceTask['status'] = 'UPCOMING';
      
      // Check if task is part of an active unresolved conflict on this sub-block
      const hasUnresolvedConflict = conflicts.some(
        c => !c.isResolved && 
             (c.task1.id === task.id || c.task2.id === task.id) &&
             simTimeMinutes >= c.overlapStartMinutes &&
             simTimeMinutes <= c.overlapEndMinutes
      );

      // Check realistic dependency
      const hasUnmetDependency = task.dependencies && task.dependencies.some(depId => !completedTaskIds.has(depId));

      if (hasUnresolvedConflict) {
        status = 'CONFLICT';
      } else if (simTimeMinutes >= task.endMinutes) {
        status = 'COMPLETED';
      } else if (simTimeMinutes >= task.startMinutes) {
        if (hasUnmetDependency) {
          status = 'WAITING_DEPENDENCY';
        } else {
          status = 'IN_PROGRESS';
        }
      } else {
        status = task.originalStartMinutes && task.startMinutes !== task.originalStartMinutes ? 'RESCHEDULED' : 'UPCOMING';
      }

      const progress = status === 'COMPLETED'
        ? 100
        : (status === 'IN_PROGRESS' || status === 'CONFLICT')
        ? Math.min(100, Math.max(0, Math.round(((simTimeMinutes - task.startMinutes) / Math.max(1, task.endMinutes - task.startMinutes)) * 100)))
        : 0;

      return {
        ...task,
        status,
        progress
      };
    });
  }, [tasks, simTimeMinutes, conflicts]);

  // Operational Impacts Evaluation Engine (Calculates impacts on scheduled train operations)
  const operationalImpacts = useMemo<OperationalImpactItem[]>(() => {
    // 1. Build map of currently blocked sub-blocks under active maintenance
    const blockedBlocks = new Map<string, MaintenanceTask>();
    evaluatedTasks.forEach(task => {
      if (task.status === 'IN_PROGRESS' || task.status === 'CONFLICT') {
        blockedBlocks.set(task.subBlockId, task);
      }
    });

    const impacts: OperationalImpactItem[] = [];

    operations.forEach(op => {
      // Find if any sub-block along the train's scheduled primary path is currently blocked
      const blockedId = op.pathSubBlockIds.find(id => blockedBlocks.has(id));
      if (!blockedId) return;

      const task = blockedBlocks.get(blockedId)!;

      // Option A: Delay Operation
      const delayMinutesA = Math.max(10, (task.endMinutes + 5) - op.scheduledTimeMinutes);
      const revisedTimeA = op.scheduledTimeMinutes + delayMinutesA;

      // Option B: Alternative Track / Crossover Path
      const altBlocked = op.alternativePathSubBlockIds.some(id => blockedBlocks.has(id));
      const isAltAvailable = !altBlocked;
      const delayMinutesB = 10; // 30 km/h turnout speed restriction across crossover
      const revisedTimeB = op.scheduledTimeMinutes + delayMinutesB;

      // Option C: Reschedule Maintenance
      const isMaintRescheduleAllowed = task.priority !== 'Critical';
      const delayMinutesC = 0;
      const newMaintStart = op.scheduledTimeMinutes + 35;
      const newMaintEnd = newMaintStart + (task.endMinutes - task.startMinutes);

      // Deterministic Decision Matrix (Select minimum delay impact):
      let chosenOption: 'OPTION_A_DELAY' | 'OPTION_B_ALT_TRACK' | 'OPTION_C_RESCHEDULE' = 'OPTION_B_ALT_TRACK';
      let finalDelay = delayMinutesB;
      let revisedFormatted = minutesToTimeString(revisedTimeB);
      let summary = `Diverted via universal crossover to Track ${op.alternativeTrack} (+10 min). Minimum impact selected.`;

      if (task.priority === 'Critical') {
        if (isAltAvailable) {
          chosenOption = 'OPTION_B_ALT_TRACK';
          finalDelay = delayMinutesB;
          revisedFormatted = minutesToTimeString(revisedTimeB);
          summary = `Track ${op.primaryTrack} closed for Critical ${DEPARTMENTS[task.departmentId].shortName} maintenance. Diverted via crossover to Track ${op.alternativeTrack} (+10 min).`;
        } else {
          chosenOption = 'OPTION_A_DELAY';
          finalDelay = delayMinutesA;
          revisedFormatted = minutesToTimeString(revisedTimeA);
          summary = `Both routes constrained. Train held until ${minutesToTimeString(revisedTimeA)} (+${delayMinutesA} min).`;
        }
      } else if (task.priority === 'High') {
        if (isAltAvailable) {
          chosenOption = 'OPTION_B_ALT_TRACK';
          finalDelay = delayMinutesB;
          revisedFormatted = minutesToTimeString(revisedTimeB);
          summary = `Diverting to Track ${op.alternativeTrack} via universal crossover. Delay minimized to +10 min.`;
        } else if (isMaintRescheduleAllowed) {
          chosenOption = 'OPTION_C_RESCHEDULE';
          finalDelay = 0;
          revisedFormatted = minutesToTimeString(op.scheduledTimeMinutes);
          summary = `Maintenance rescheduled to ${minutesToTimeString(newMaintStart)}. Zero operational delay.`;
        } else {
          chosenOption = 'OPTION_A_DELAY';
          finalDelay = delayMinutesA;
          revisedFormatted = minutesToTimeString(revisedTimeA);
          summary = `Held at origin until maintenance clear (+${delayMinutesA} min).`;
        }
      } else {
        if (isMaintRescheduleAllowed) {
          chosenOption = 'OPTION_C_RESCHEDULE';
          finalDelay = 0;
          revisedFormatted = minutesToTimeString(op.scheduledTimeMinutes);
          summary = `Low priority maintenance deferred to ${minutesToTimeString(newMaintStart)}. Operation on time (0 min delay).`;
        } else if (isAltAvailable) {
          chosenOption = 'OPTION_B_ALT_TRACK';
          finalDelay = delayMinutesB;
          revisedFormatted = minutesToTimeString(revisedTimeB);
          summary = `Diverted to Track ${op.alternativeTrack} via crossover (+10 min).`;
        } else {
          chosenOption = 'OPTION_A_DELAY';
          finalDelay = delayMinutesA;
          revisedFormatted = minutesToTimeString(revisedTimeA);
          summary = `Held until track release (+${delayMinutesA} min).`;
        }
      }

      impacts.push({
        id: `impact-${op.id}-${task.id}`,
        operationId: op.id,
        operationName: op.name,
        subBlockId: blockedId,
        taskId: task.id,
        departmentId: task.departmentId,
        scheduledTimeMinutes: op.scheduledTimeMinutes,
        isMitigated: true,
        options: {
          optionA_delay: {
            delayMinutes: delayMinutesA,
            revisedTimeMinutes: revisedTimeA,
            description: `Hold train until ${minutesToTimeString(revisedTimeA)} (+${delayMinutesA} min)`
          },
          optionB_altTrack: {
            isAvailable: isAltAvailable,
            delayMinutes: delayMinutesB,
            revisedTimeMinutes: revisedTimeB,
            altTrackNumber: op.alternativeTrack,
            description: isAltAvailable ? `Divert via crossover to Track ${op.alternativeTrack} (+10 min)` : 'Alternative track also occupied'
          },
          optionC_reschedule: {
            isAllowed: isMaintRescheduleAllowed,
            delayMinutes: delayMinutesC,
            newStartMinutes: newMaintStart,
            newEndMinutes: newMaintEnd,
            reasonIfNotAllowed: task.priority === 'Critical' ? 'Critical priority cannot be deferred' : undefined,
            description: isMaintRescheduleAllowed ? `Reschedule ${task.activity} to ${minutesToTimeString(newMaintStart)} (0 min delay)` : 'Priority prevents rescheduling'
          }
        },
        chosenOption,
        finalDelayMinutes: finalDelay,
        revisedTimeFormatted: revisedFormatted,
        summary
      });
    });

    return impacts;
  }, [operations, evaluatedTasks]);

  // Active operational impact to display on map notification banner
  const activeImpact = useMemo(() => {
    return operationalImpacts.find(imp => {
      if (dismissedImpactId === imp.id) return false;
      const opTime = imp.scheduledTimeMinutes;
      // Active window: within 45 min of scheduled traversal
      return simTimeMinutes >= opTime - 35 && simTimeMinutes <= opTime + 45;
    }) || null;
  }, [operationalImpacts, simTimeMinutes, dismissedImpactId]);

  // Spatial Department Crew movement and transit state calculation
  const crewStates = useMemo<Record<DepartmentId, DepartmentCrewState>>(() => {
    const deptIds: DepartmentId[] = ['engineering', 'traction', 'signaling'];
    const defaultBases: Record<DepartmentId, string> = {
      engineering: 'SB-01',
      traction: 'SB-04',
      signaling: 'SB-07'
    };
    const defaultCrewNames: Record<DepartmentId, string> = {
      engineering: 'ENGINEERING CREW',
      traction: 'TRACTION CREW',
      signaling: 'S&T CREW'
    };

    const result: Partial<Record<DepartmentId, DepartmentCrewState>> = {};

    deptIds.forEach(deptId => {
      const deptTasks = evaluatedTasks
        .filter(t => t.departmentId === deptId)
        .sort((a, b) => a.startMinutes - b.startMinutes);

      const activeTask = deptTasks.find(t => t.status === 'IN_PROGRESS' || t.status === 'CONFLICT' || t.status === 'WAITING_DEPENDENCY');

      if (activeTask) {
        const subBlockIdx = Math.max(0, SUB_BLOCKS.findIndex(b => b.id === activeTask.subBlockId));
        if (activeTask.status === 'WAITING_DEPENDENCY') {
          result[deptId] = {
            departmentId: deptId,
            crewName: defaultCrewNames[deptId],
            status: 'WAITING_DEPENDENCY',
            currentSubBlockId: activeTask.subBlockId,
            corridorPositionIndex: subBlockIdx,
            activeTaskId: activeTask.id,
            activity: activeTask.activity,
            progressPercent: 0,
            message: `Awaiting prerequisite clearance for ${activeTask.activity} on ${activeTask.subBlockId}`
          };
        } else {
          result[deptId] = {
            departmentId: deptId,
            crewName: defaultCrewNames[deptId],
            status: 'WORKING',
            currentSubBlockId: activeTask.subBlockId,
            corridorPositionIndex: subBlockIdx,
            activeTaskId: activeTask.id,
            activity: activeTask.activity,
            progressPercent: activeTask.progress || 0,
            message: `Working at ${activeTask.subBlockId}: ${activeTask.activity} (${activeTask.progress || 0}%)`
          };
        }
        return;
      }

      // No active task: check if transitioning to next scheduled task or on standby
      const prevTasks = deptTasks.filter(t => t.endMinutes <= simTimeMinutes);
      const prevTask = prevTasks.length > 0 ? prevTasks[prevTasks.length - 1] : null;
      const nextTask = deptTasks.find(t => t.startMinutes > simTimeMinutes);

      const fromSubBlockId = prevTask ? prevTask.subBlockId : defaultBases[deptId];
      const fromIdx = Math.max(0, SUB_BLOCKS.findIndex(b => b.id === fromSubBlockId));

      if (nextTask) {
        const toIdx = Math.max(0, SUB_BLOCKS.findIndex(b => b.id === nextTask.subBlockId));
        const distance = Math.abs(toIdx - fromIdx);
        const travelMinutes = Math.max(10, Math.min(25, distance * 5 + 5));

        // When does relocation start? Promptly after previous task finishes (+5 min packup),
        // or ahead of next task if no prevTask
        let travelStartMinutes = prevTask ? prevTask.endMinutes + 5 : Math.max(0, nextTask.startMinutes - travelMinutes);
        travelStartMinutes = Math.min(travelStartMinutes, Math.max(0, nextTask.startMinutes - travelMinutes));
        const travelEndMinutes = travelStartMinutes + travelMinutes;

        if (simTimeMinutes >= travelStartMinutes && simTimeMinutes < travelEndMinutes) {
          // Actively moving across corridor
          const transitProgress = Math.min(100, Math.max(0, Math.round(((simTimeMinutes - travelStartMinutes) / travelMinutes) * 100)));
          const interpolatedIndex = fromIdx + (toIdx - fromIdx) * (transitProgress / 100);

          result[deptId] = {
            departmentId: deptId,
            crewName: defaultCrewNames[deptId],
            status: 'MOVING',
            currentSubBlockId: fromSubBlockId,
            targetSubBlockId: nextTask.subBlockId,
            fromSubBlockId,
            transitProgressPercent: transitProgress,
            corridorPositionIndex: interpolatedIndex,
            activity: `Relocating to ${nextTask.subBlockId}`,
            progressPercent: transitProgress,
            message: `Moving to ${nextTask.subBlockId} (${transitProgress}% en route)`,
            nextTaskId: nextTask.id,
            nextActivity: nextTask.activity,
            nextStartTimeMinutes: nextTask.startMinutes,
            nextSubBlockId: nextTask.subBlockId
          };
        } else if (simTimeMinutes >= travelEndMinutes && simTimeMinutes < nextTask.startMinutes) {
          // Arrived at destination sub-block ahead of task start
          result[deptId] = {
            departmentId: deptId,
            crewName: defaultCrewNames[deptId],
            status: 'ARRIVED',
            currentSubBlockId: nextTask.subBlockId,
            targetSubBlockId: nextTask.subBlockId,
            fromSubBlockId,
            transitProgressPercent: 100,
            corridorPositionIndex: toIdx,
            activeTaskId: nextTask.id,
            activity: `Equipment Staging at ${nextTask.subBlockId}`,
            progressPercent: 0,
            message: `Arrived at ${nextTask.subBlockId}; staging for ${nextTask.activity} (${minutesToTimeString(nextTask.startMinutes)})`,
            nextTaskId: nextTask.id,
            nextActivity: nextTask.activity,
            nextStartTimeMinutes: nextTask.startMinutes,
            nextSubBlockId: nextTask.subBlockId
          };
        } else {
          // Standby before relocation starts
          result[deptId] = {
            departmentId: deptId,
            crewName: defaultCrewNames[deptId],
            status: 'STANDBY',
            currentSubBlockId: fromSubBlockId,
            corridorPositionIndex: fromIdx,
            activity: 'Standby / Equipment Check',
            progressPercent: 0,
            message: `Standby at ${fromSubBlockId}. Next: ${nextTask.activity} at ${nextTask.subBlockId} (${minutesToTimeString(nextTask.startMinutes)})`,
            nextTaskId: nextTask.id,
            nextActivity: nextTask.activity,
            nextStartTimeMinutes: nextTask.startMinutes,
            nextSubBlockId: nextTask.subBlockId
          };
        }
      } else {
        result[deptId] = {
          departmentId: deptId,
          crewName: defaultCrewNames[deptId],
          status: 'COMPLETED',
          currentSubBlockId: fromSubBlockId,
          corridorPositionIndex: fromIdx,
          activity: 'Daily Maintenance Schedule Completed',
          progressPercent: 100,
          message: `All daily possessions completed at ${fromSubBlockId}. Depot secured.`
        };
      }
    });

    return result as Record<DepartmentId, DepartmentCrewState>;
  }, [evaluatedTasks, simTimeMinutes]);

  // Sub-block status evaluator matching requested maintenance states
  const getSubBlockStatus = useCallback((subBlockId: string) => {
    const activeTasks = evaluatedTasks.filter(
      t => t.subBlockId === subBlockId && (t.status === 'IN_PROGRESS' || t.status === 'CONFLICT' || t.status === 'WAITING_DEPENDENCY')
    );
    const upcomingTasks = evaluatedTasks.filter(
      t => t.subBlockId === subBlockId && (t.status === 'UPCOMING' || t.status === 'RESCHEDULED')
    );
    const completedTasks = evaluatedTasks.filter(
      t => t.subBlockId === subBlockId && t.status === 'COMPLETED'
    );
    const hasConflict = activeTasks.some(t => t.status === 'CONFLICT');

    let status: SubBlockStatus = 'AVAILABLE';
    if (hasConflict) {
      status = 'CONFLICT';
    } else if (activeTasks.some(t => t.status === 'IN_PROGRESS')) {
      status = 'UNDER_MAINTENANCE';
    } else if (completedTasks.length > 0 && activeTasks.length === 0) {
      status = 'COMPLETED';
    } else if (upcomingTasks.some(t => t.status === 'RESCHEDULED')) {
      status = 'RESCHEDULED';
    } else if (upcomingTasks.length > 0) {
      status = 'SCHEDULED';
    } else {
      status = 'AVAILABLE';
    }

    return {
      status,
      activeTasks,
      upcomingTasks,
      completedTasks,
      hasConflict
    };
  }, [evaluatedTasks]);

  // Compute live metrics
  const metrics = useMemo<CoordinationMetric>(() => {
    let completedCount = 0;
    let inProgressCount = 0;
    let upcomingCount = 0;
    let totalMinutes = 0;
    const utilizedSubBlocks = new Set<string>();

    const engStats = { completed: 0, total: 0, totalMinutes: 0 };
    const trdStats = { completed: 0, total: 0, totalMinutes: 0 };
    const sntStats = { completed: 0, total: 0, totalMinutes: 0 };

    evaluatedTasks.forEach(task => {
      const taskDuration = task.endMinutes - task.startMinutes;
      totalMinutes += taskDuration;

      if (task.departmentId === 'engineering') engStats.total++;
      if (task.departmentId === 'traction') trdStats.total++;
      if (task.departmentId === 'signaling') sntStats.total++;

      if (task.status === 'COMPLETED') {
        completedCount++;
        utilizedSubBlocks.add(task.subBlockId);
        if (task.departmentId === 'engineering') {
          engStats.completed++;
          engStats.totalMinutes += taskDuration;
        }
        if (task.departmentId === 'traction') {
          trdStats.completed++;
          trdStats.totalMinutes += taskDuration;
        }
        if (task.departmentId === 'signaling') {
          sntStats.completed++;
          sntStats.totalMinutes += taskDuration;
        }
      } else if (task.status === 'IN_PROGRESS' || task.status === 'CONFLICT') {
        inProgressCount++;
        utilizedSubBlocks.add(task.subBlockId);
      } else {
        upcomingCount++;
      }
    });

    const conflictsDetected = conflicts.length;
    const conflictsResolved = conflicts.filter(c => c.isResolved).length;
    const activeConflicts = conflictsDetected - conflictsResolved;

    // Corridor utilization percent based on sub-blocks utilized over 10
    const corridorUtilizationPercent = Math.min(100, Math.round((utilizedSubBlocks.size / SUB_BLOCKS.length) * 100));

    // Coordination efficiency score: based on resolution rate and completion pace
    const conflictPenalty = activeConflicts * 15;
    const completionBonus = (completedCount / Math.max(1, evaluatedTasks.length)) * 40;
    const baseEfficiency = 85;
    const coordinationEfficiencyScore = Math.max(
      40,
      Math.min(98, Math.round(baseEfficiency + completionBonus - conflictPenalty + (conflictsResolved * 5)))
    );

    const operationalImpactsDetected = operationalImpacts.length;
    const operationalImpactsMitigated = operationalImpacts.filter(i => i.isMitigated).length;
    const alternativesSelected = {
      altTrack: operationalImpacts.filter(i => i.chosenOption === 'OPTION_B_ALT_TRACK').length,
      delayed: operationalImpacts.filter(i => i.chosenOption === 'OPTION_A_DELAY').length,
      maintRescheduled: operationalImpacts.filter(i => i.chosenOption === 'OPTION_C_RESCHEDULE').length
    };
    const totalOperationalDelayIncurredMinutes = operationalImpacts.reduce((acc, curr) => acc + curr.finalDelayMinutes, 0);
    const totalOperationalDelaySavedMinutes = operationalImpacts.reduce((acc, curr) => {
      const delayA = curr.options.optionA_delay.delayMinutes;
      return acc + Math.max(0, delayA - curr.finalDelayMinutes);
    }, 0);

    return {
      totalTasks: evaluatedTasks.length,
      completedTasks: completedCount,
      inProgressTasks: inProgressCount,
      upcomingTasks: upcomingCount,
      conflictsDetected,
      conflictsResolved,
      activeConflicts,
      totalMaintenanceMinutes: totalMinutes,
      corridorUtilizationPercent,
      coordinationEfficiencyScore,
      subBlocksUtilizedCount: utilizedSubBlocks.size,
      totalSubBlocksCount: SUB_BLOCKS.length,
      departmentBreakdown: {
        engineering: engStats,
        traction: trdStats,
        signaling: sntStats
      },
      operationalImpactsDetected,
      operationalImpactsMitigated,
      alternativesSelected,
      totalOperationalDelaySavedMinutes,
      totalOperationalDelayIncurredMinutes
    };
  }, [evaluatedTasks, conflicts, operationalImpacts]);

  // Main Simulation Clock Loop
  useEffect(() => {
    if (!isRunning) return;

    // Tick interval: 100ms
    // At 1x speed: 10 simulated minutes per second -> 1.0 simulated minute per 100ms tick
    const tickIntervalMs = 100;
    const minutesPerTick = (10 * speed) / (1000 / tickIntervalMs);

    const timer = setInterval(() => {
      setSimTimeMinutes(prev => {
        const next = prev + minutesPerTick;
        if (next >= 1440) {
          // Day is complete!
          setIsRunning(false);
          setShowDaySummary(true);
          return 1440;
        }
        return next;
      });
    }, tickIntervalMs);

    return () => clearInterval(timer);
  }, [isRunning, speed]);

  // Log milestones automatically as time advances
  useEffect(() => {
    const currentM = Math.floor(simTimeMinutes);

    evaluatedTasks.forEach(task => {
      // 1. Task Entry / Start
      const startKey = `start-${task.id}`;
      if (currentM >= task.startMinutes && currentM < task.endMinutes && !loggedMilestonesRef.current.has(startKey)) {
        loggedMilestonesRef.current.add(startKey);
        addLog(
          'START',
          `${DEPARTMENTS[task.departmentId].name} entered ${task.subBlockId} and commenced "${task.activity}" (Crew: ${task.crewCount}, Equip: ${task.equipment.split(',')[0]}).`,
          task.departmentId,
          task.subBlockId,
          task.startMinutes
        );
      }

      // 2. Task 50% Progress
      const midM = Math.floor((task.startMinutes + task.endMinutes) / 2);
      const midKey = `mid-${task.id}`;
      if (currentM >= midM && currentM < task.endMinutes && !loggedMilestonesRef.current.has(midKey)) {
        loggedMilestonesRef.current.add(midKey);
        addLog(
          'PROGRESS',
          `${task.activity} on ${task.subBlockId} is 50% completed under safe track possession.`,
          task.departmentId,
          task.subBlockId,
          midM
        );
      }

      // 3. Task Completion
      const endKey = `end-${task.id}`;
      if (currentM >= task.endMinutes && !loggedMilestonesRef.current.has(endKey)) {
        loggedMilestonesRef.current.add(endKey);
        addLog(
          'COMPLETION',
          `COMPLETED: ${task.activity} on ${task.subBlockId} successfully finalized. Possession released, asset restored to traffic readiness.`,
          task.departmentId,
          task.subBlockId,
          task.endMinutes
        );
      }
    });

    // 4. Log active conflict notice if approaching or entering overlap
    conflicts.forEach(c => {
      const conflictKey = `conflict-${c.id}`;
      if (!c.isResolved && currentM >= c.overlapStartMinutes - 30 && currentM <= c.overlapEndMinutes && !loggedMilestonesRef.current.has(conflictKey)) {
        loggedMilestonesRef.current.add(conflictKey);
        addLog(
          'CONFLICT',
          `⚠ MAINTENANCE CONFLICT DETECTED on ${c.subBlockId}: ${DEPARTMENTS[c.task1.departmentId].shortName} and ${DEPARTMENTS[c.task2.departmentId].shortName} have overlapping block possession (${minutesToTimeString(c.overlapStartMinutes)} - ${minutesToTimeString(c.overlapEndMinutes)}). Overlap: ${c.overlapDurationMinutes} mins.`,
          c.task2.departmentId,
          c.subBlockId,
          c.overlapStartMinutes
        );
      }
    });
  }, [simTimeMinutes, evaluatedTasks, conflicts, addLog]);

  // Actions
  const startSimulation = useCallback(() => {
    if (simTimeMinutes >= 1440) {
      setSimTimeMinutes(0);
      loggedMilestonesRef.current = new Set(['init-0']);
    }
    setIsRunning(true);
    addLog('SYSTEM', 'Simulation clock started/resumed.');
  }, [simTimeMinutes, addLog]);

  const pauseSimulation = useCallback(() => {
    setIsRunning(false);
    addLog('SYSTEM', `Simulation paused at ${minutesToTimeString(simTimeMinutes)}.`);
  }, [simTimeMinutes, addLog]);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setSimTimeMinutes(0);
    setTasks(JSON.parse(JSON.stringify(INITIAL_TASKS)));
    setConflictList(detectInitialConflicts());
    loggedMilestonesRef.current = new Set(['init-0', 'init-1', 'init-2']);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setShowSubBlockModal(false);
    setShowDaySummary(false);
    setShowReportModal(false);
    setSelectedSubBlockId(null);
    addLog('SYSTEM', 'Simulation reset to 00:00. Initial corridor schedule restored.');
  }, [addLog]);

  const runAgain = useCallback(() => {
    resetSimulation();
    setTimeout(() => {
      setIsRunning(true);
    }, 150);
  }, [resetSimulation]);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
    addLog('SYSTEM', `Simulation speed set to ${newSpeed}x.`);
  }, [addLog]);

  const jumpToTime = useCallback((minutes: number) => {
    const clamped = Math.max(0, Math.min(1440, minutes));
    setSimTimeMinutes(clamped);

    // Prune future milestone keys so they can re-trigger if advancing from here
    loggedMilestonesRef.current = new Set(['init-0', 'init-1', 'init-2']);

    addLog('SYSTEM', `Simulation jumped to ${minutesToTimeString(clamped)}.`);
  }, [addLog]);

  const openSubBlockModal = useCallback((subBlockId: string) => {
    setSelectedSubBlockId(subBlockId);
    setShowSubBlockModal(true);
  }, []);

  const closeSubBlockModal = useCallback(() => {
    setSelectedSubBlockId(null);
    setShowSubBlockModal(false);
  }, []);

  const selectSubBlock = useCallback((subBlockId: string | null) => {
    setSelectedSubBlockId(subBlockId);
    setShowSubBlockModal(Boolean(subBlockId));
  }, []);

  const selectTask = useCallback((taskId: string | null) => {
    setSelectedTaskId(taskId);
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedSubBlockId(task.subBlockId);
        setShowSubBlockModal(true);
      }
    }
  }, [tasks]);

  // AI-Powered Conflict Resolution mechanism
  const resolveConflict = useCallback((conflictId: string) => {
    const conflict = conflictList.find(c => c.id === conflictId);
    if (!conflict) return;

    const { targetTaskId, newSubBlockId, newStartMinutes, newEndMinutes, reason } = conflict.suggestedResolution;

    // 1. Apply the resolution by shifting the target task to non-interfering slot
    setTasks(prevTasks =>
      prevTasks.map(t => {
        if (t.id === targetTaskId) {
          return {
            ...t,
            subBlockId: newSubBlockId,
            startMinutes: newStartMinutes,
            endMinutes: newEndMinutes,
            isConflicted: false,
            resolvedNote: `Rescheduled by AI Coordination Engine to ${newSubBlockId} (${minutesToTimeString(newStartMinutes)} - ${minutesToTimeString(newEndMinutes)})`
          };
        }
        if (t.id === conflict.task1.id) {
          return {
            ...t,
            isConflicted: false
          };
        }
        return t;
      })
    );

    // 2. Mark this conflict as resolved in conflictList so metrics and history persist
    setConflictList(prev =>
      prev.map(c => c.id === conflictId ? { ...c, isResolved: true } : c)
    );

    // 3. Log AI Coordination Actions
    const currentM = Math.floor(simTimeMinutes);
    addLog(
      'AI_RECOMMENDATION',
      `AI Coordination Engine generated recommendation: ${reason}`,
      conflict.task2.departmentId,
      conflict.subBlockId,
      currentM
    );

    addLog(
      'RESCHEDULE',
      `Auto-Resolved: Shifted "${conflict.task2.activity}" (${DEPARTMENTS[conflict.task2.departmentId].shortName}) from ${conflict.subBlockId} to ${newSubBlockId} [${minutesToTimeString(newStartMinutes)} - ${minutesToTimeString(newEndMinutes)}]. Zero corridor contention achieved.`,
      conflict.task2.departmentId,
      newSubBlockId,
      currentM
    );

    addLog(
      'SYSTEM',
      `Corridor maintenance schedule optimized. Asset availability preserved on ${conflict.subBlockId}.`,
      undefined,
      conflict.subBlockId,
      currentM
    );
  }, [conflictList, simTimeMinutes, addLog]);

  // Demo trigger to deliberately inject another conflict for testing
  const triggerDemoConflict = useCallback(() => {
    const currentM = Math.floor(simTimeMinutes);
    
    // Find an upcoming or active task to create a realistic overlap with
    const candidateTask = tasks.find(t => t.endMinutes > currentM && t.departmentId !== 'signaling') ||
                          tasks.find(t => t.endMinutes > currentM) ||
                          tasks[tasks.length - 1];

    const targetSubBlock = candidateTask ? candidateTask.subBlockId : (selectedSubBlockId || 'SB-06');
    const startM = candidateTask ? Math.max(currentM, candidateTask.startMinutes) : currentM + 15;
    const endM = Math.min(1440, startM + 80);

    const conflictDept: DepartmentId = candidateTask?.departmentId === 'signaling' ? 'traction' : 'signaling';

    const testConflictTask: MaintenanceTask = {
      id: `TASK-INJECTED-${Date.now()}`,
      departmentId: conflictDept,
      subBlockId: targetSubBlock,
      activity: `${DEPARTMENTS[conflictDept].shortName} Emergency Asset Health Inspection`,
      category: conflictDept === 'signaling' ? 'Telecom/cable inspection' : 'Electrical inspection',
      startMinutes: startM,
      endMinutes: endM,
      durationMinutes: endM - startM,
      status: 'UPCOMING',
      priority: 'High',
      crewCount: 6,
      equipment: 'Mobile diagnostics test unit, optical sensor probe',
      safetyProtocol: 'Corridor Emergency Access Permit',
      isConflicted: true
    };

    setTasks(prev => [...prev, testConflictTask]);

    const overlapStart = startM;
    const overlapEnd = candidateTask ? Math.min(endM, candidateTask.endMinutes) : endM;
    const resolvedShiftSubBlock = targetSubBlock === 'SB-05' ? 'SB-06' : (targetSubBlock === 'SB-06' ? 'SB-07' : 'SB-02');
    const resolvedStart = Math.min(1380, (candidateTask ? candidateTask.endMinutes : endM) + 15);
    const resolvedEnd = Math.min(1440, resolvedStart + 80);

    const newConflictItem: ConflictItem = {
      id: `conflict-injected-${Date.now()}`,
      subBlockId: targetSubBlock,
      task1: candidateTask || testConflictTask,
      task2: testConflictTask,
      overlapStartMinutes: overlapStart,
      overlapEndMinutes: overlapEnd,
      overlapDurationMinutes: Math.max(15, overlapEnd - overlapStart),
      isResolved: false,
      suggestedResolution: {
        targetTaskId: testConflictTask.id,
        newSubBlockId: resolvedShiftSubBlock,
        newStartMinutes: resolvedStart,
        newEndMinutes: resolvedEnd,
        reason: `Reschedule injected ${DEPARTMENTS[conflictDept].name} to non-interfering slot on ${resolvedShiftSubBlock} [${minutesToTimeString(resolvedStart)} - ${minutesToTimeString(resolvedEnd)}] after track possession is released.`
      }
    };

    setConflictList(prev => [...prev, newConflictItem]);

    addLog(
      'CONFLICT',
      `⚠ Injected Test Conflict on ${targetSubBlock} at ${minutesToTimeString(startM)} to demonstrate AI automatic resolution!`,
      conflictDept,
      targetSubBlock,
      currentM
    );
  }, [simTimeMinutes, tasks, selectedSubBlockId, addLog]);

  // Demo trigger to test Operational Impact Detection on scheduled trains
  const triggerDemoImpact = useCallback(() => {
    // Jump to 08:25 where EXP-101 (08:30 Vande Bharat Express) approaches SB-03
    setSimTimeMinutes(505); // 08:25
    setDismissedImpactId(null);
    setIsRunning(true);
    addLog(
      'SYSTEM',
      'Operational Impact Demo triggered: 08:30 Vande Bharat Express (EXP-101) traversing corridor while SB-03 is under Engineering track possession.'
    );
  }, [addLog]);

  const dismissImpact = useCallback(() => {
    if (activeImpact) {
      setDismissedImpactId(activeImpact.id);
    }
  }, [activeImpact]);

  const value = useMemo(() => ({
    simTimeMinutes,
    timeFormatted: minutesToTimeString(simTimeMinutes),
    isRunning,
    speed,
    tasks: evaluatedTasks,
    conflicts,
    activityLogs,
    selectedSubBlockId,
    selectedTaskId,
    showSubBlockModal,
    showDaySummary,
    showReportModal,
    activeConflict,
    metrics,
    crewStates,
    operations,
    operationalImpacts,
    activeImpact,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    runAgain,
    setSpeed,
    jumpToTime,
    selectSubBlock,
    openSubBlockModal,
    closeSubBlockModal,
    selectTask,
    setShowDaySummary,
    setShowReportModal,
    resolveConflict,
    triggerDemoConflict,
    triggerDemoImpact,
    dismissImpact,
    getSubBlockStatus
  }), [
    simTimeMinutes,
    isRunning,
    speed,
    evaluatedTasks,
    conflicts,
    activityLogs,
    selectedSubBlockId,
    selectedTaskId,
    showSubBlockModal,
    showDaySummary,
    showReportModal,
    activeConflict,
    metrics,
    crewStates,
    operations,
    operationalImpacts,
    activeImpact,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    runAgain,
    setSpeed,
    jumpToTime,
    selectSubBlock,
    openSubBlockModal,
    closeSubBlockModal,
    selectTask,
    setShowDaySummary,
    setShowReportModal,
    resolveConflict,
    triggerDemoConflict,
    triggerDemoImpact,
    dismissImpact,
    getSubBlockStatus
  ]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
