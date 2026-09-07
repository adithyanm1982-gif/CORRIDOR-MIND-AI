import { create } from 'zustand';
import { RealTask } from '@/shared/types/railsyncReal';
import { generateLocalRequestSeed } from './localRequestSeed';

const CORRIDOR_STATIONS: Record<string, { from: string; to: string }> = {
  C01: { from: 'ST01', to: 'ST02' },
  C02: { from: 'ST02', to: 'ST03' },
  C03: { from: 'ST03', to: 'ST04' },
  C04: { from: 'ST04', to: 'ST05' },
};

const URGENCY_SCORE: Record<string, number> = { IMMEDIATE: 90, HIGH: 70, MEDIUM: 50, NORMAL: 30, LOW: 15 };

/** What a dept user actually fills in -- no raw risk-score numbers, just practical fields. Severity/criticality/safety figures are derived automatically from urgency + duration. */
export interface RaiseRequestInput {
  department: RealTask['department'];
  asset_type: string;
  maintenance_type: string;
  issue: string;
  corridor_id: string;
  estimated_duration_hours: number;
  urgency: RealTask['urgency'];
  preferred_day: string;
}

interface LocalRequestState {
  requests: RealTask[];
  raiseRequest: (input: RaiseRequestInput) => void;
  approveRequest: (requestId: string, approvedBy: string, comments?: string) => void;
  rejectRequest: (requestId: string, approvedBy: string, comments?: string) => void;
}

let nextLocalId = 1000;

/**
 * The single local queue backing the whole Requests/Approvals
 * workflow -- deliberately NOT the live 420-item /api/tasks/ feed.
 * The real backend has no create endpoint, so this is a fully local,
 * fixed-size (50 seeded + whatever gets raised in-session) dataset
 * that Engineering/S&T/Traction can add to and the Controller can
 * approve/reject. Single source of truth for both the Requests tab
 * (role-gated: dept users see a raise form, Controller sees the
 * list) and the Approvals tab.
 */
export const useLocalRequestStore = create<LocalRequestState>((set) => ({
  requests: generateLocalRequestSeed(),

  raiseRequest: (input) =>
    set((state) => {
      const id = nextLocalId++;
      const request_id = `REQ-N${id}`;
      const stations = CORRIDOR_STATIONS[input.corridor_id] ?? { from: 'ST01', to: 'ST02' };
      const urgencyScore = URGENCY_SCORE[input.urgency] ?? 30;
      // duration nudges the derived risk figures up slightly for longer jobs -- a reasonable, explainable heuristic, not arbitrary
      const durationFactor = Math.min(20, input.estimated_duration_hours * 1.5);

      const newRequest: RealTask = {
        request_id,
        department: input.department,
        planning_type: 'NORMAL',
        preferred_day: input.preferred_day,
        corridor_id: input.corridor_id,
        subsection_id: `${input.corridor_id}-S01`,
        work_area_id: `${input.corridor_id}-WA-${request_id}`,
        from_station: stations.from,
        to_station: stations.to, 
        asset_id: `AST-${input.department.slice(0, 3).toUpperCase()}-${id}`,
        asset_type: input.asset_type,
        maintenance_type: input.maintenance_type,
        issue: input.issue,
        severity: Math.round(Math.min(5, 1 + urgencyScore / 25) * 10) / 10,
        criticality: Math.round(Math.min(100, urgencyScore + durationFactor)),
        urgency: input.urgency,
        overdue_days: 0,
        estimated_duration_hours: Math.round(input.estimated_duration_hours * 100) / 100,
        safety_risk: Math.round(Math.min(100, urgencyScore + durationFactor * 0.8)),
        operational_impact: Math.round(Math.min(100, urgencyScore + durationFactor * 0.6)),
        request_status: 'PENDING',
        planning_cycle: 'NEXT_7_DAYS',
        request_source: 'MANUAL',
        deadline_day: input.preferred_day,
        controller_status: 'PENDING_REVIEW',
        approval_required: true,
      };
      return { requests: [newRequest, ...state.requests] };
    }),

  approveRequest: (requestId, approvedBy, comments) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.request_id === requestId
          ? { ...r, request_status: 'APPROVED', controller_status: `APPROVED by ${approvedBy}${comments ? ` -- ${comments}` : ''}` }
          : r
      ),
    })),

  rejectRequest: (requestId, approvedBy, comments) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.request_id === requestId
          ? { ...r, request_status: 'REJECTED', controller_status: `REJECTED by ${approvedBy}${comments ? ` -- ${comments}` : ''}` }
          : r
      ),
    })),
}));
