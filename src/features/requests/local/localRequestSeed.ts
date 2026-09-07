import { RealTask, RealDepartment, Urgency } from '@/shared/types/railsyncReal';

/**
 * Generates the fixed 50-request local queue: 40 requests under 4
 * hours estimated duration, 10 requests over 4 hours, spread across
 * Engineering, S&T, and Traction. This REPLACES the live 420-item
 * /api/tasks/ feed for the Requests/Approvals workflow specifically
 * -- the real backend has no create/POST endpoint, so a fixed,
 * purpose-built local dataset is what makes "departments raise
 * requests, controller approves them" actually work end to end.
 * Shaped exactly like RealTask so every existing display component
 * (tables, priority breakdown, approval cards) works unchanged.
 */

const CORRIDOR_STATIONS: Record<string, { from: string; to: string }> = {
  C01: { from: 'ST01', to: 'ST02' },
  C02: { from: 'ST02', to: 'ST03' },
  C03: { from: 'ST03', to: 'ST04' }, 
  C04: { from: 'ST04', to: 'ST05' },
};
const CORRIDOR_IDS = Object.keys(CORRIDOR_STATIONS);

const DEPARTMENTS: RealDepartment[] = ['Engineering', 'S&T', 'Traction'];

const ASSET_TYPES_BY_DEPT: Record<RealDepartment, string[]> = {
  Engineering: ['Track', 'Sleeper', 'Bridge', 'Rail'],
  'S&T': ['Signal', 'Point Machine', 'Interlocking', 'Axle Counter', 'Telecom'],
  Traction: ['OHE', 'Catenary', 'Traction Mast', 'Pantograph Interface', 'Isolator'],
};

const MAINTENANCE_TYPES_BY_DEPT: Record<RealDepartment, string[]> = {
  Engineering: ['Track Inspection', 'Rail Renewal', 'Sleeper Replacement', 'Bridge Structural Check'],
  'S&T': ['Signal Calibration', 'Interlocking Test', 'Point Machine Lubrication', 'Axle Counter Reset'],
  Traction: ['OHE Tension Check', 'Catenary Dropper Replacement', 'Isolator Servicing', 'Mast Inspection'],
};

const URGENCIES: Urgency[] = ['IMMEDIATE', 'HIGH', 'MEDIUM', 'NORMAL', 'LOW'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildOne(index: number, department: RealDepartment, durationHours: number, rand: () => number): RealTask {
  const corridorId = CORRIDOR_IDS[Math.floor(rand() * CORRIDOR_IDS.length)];
  const stations = CORRIDOR_STATIONS[corridorId];
  const subsectionSuffix = Math.floor(rand() * 4) + 1;
  const assetTypes = ASSET_TYPES_BY_DEPT[department];
  const maintenanceTypes = MAINTENANCE_TYPES_BY_DEPT[department];
  const urgency = URGENCIES[Math.floor(rand() * URGENCIES.length)];

  return {
    request_id: `REQ-L${String(index + 1).padStart(3, '0')}`,
    department,
    planning_type: 'NORMAL',
    preferred_day: DAYS[Math.floor(rand() * DAYS.length)],
    corridor_id: corridorId,
    subsection_id: `${corridorId}-S0${subsectionSuffix}`,
    work_area_id: `${corridorId}-WA0${subsectionSuffix}`,
    from_station: stations.from,
    to_station: stations.to,
    asset_id: `AST-${department.slice(0, 3).toUpperCase()}-${100 + index}`,
    asset_type: assetTypes[Math.floor(rand() * assetTypes.length)],
    maintenance_type: maintenanceTypes[Math.floor(rand() * maintenanceTypes.length)],
    issue: `Routine ${maintenanceTypes[Math.floor(rand() * maintenanceTypes.length)].toLowerCase()} required`,
    severity: Math.round((1 + rand() * 4) * 10) / 10,
    criticality: Math.round(1 + rand() * 99),
    urgency,
    overdue_days: Math.floor(rand() * 15),
    estimated_duration_hours: Math.round(durationHours * 10) / 10,
    safety_risk: Math.round(1 + rand() * 99),
    operational_impact: Math.round(1 + rand() * 99),
    request_status: 'PENDING',
    planning_cycle: 'NEXT_7_DAYS',
    request_source: 'MANUAL',
    deadline_day: DAYS[Math.floor(rand() * DAYS.length)],
    controller_status: 'PENDING_REVIEW',
    approval_required: true,
  };
}

export function generateLocalRequestSeed(): RealTask[] {
  const rand = seededRandom(2026);
  const requests: RealTask[] = [];

  // 40 requests under 4 hours (0.5h - 3.9h), 10 over 4 hours (4.5h - 12h)
  for (let i = 0; i < 40; i++) {
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const durationHours = 0.5 + rand() * 3.4;
    requests.push(buildOne(i, department, durationHours, rand));
  }
  for (let i = 40; i < 50; i++) {
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const durationHours = 4.5 + rand() * 7.5;
    requests.push(buildOne(i, department, durationHours, rand));
  }

  return requests;
}
