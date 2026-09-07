import { DepartmentId, DepartmentInfo, MaintenanceTask, SubBlockData, ScheduledOperation } from '../types';

export const DEPARTMENTS: Record<DepartmentId, DepartmentInfo> = {
  engineering: {
    id: 'engineering',
    name: 'Engineering Department',
    shortName: 'Engineering',
    code: 'ENG / P-WAY',
    color: '#38BDF8', // Cyan / Sky Blue
    badgeBg: 'bg-[#38BDF8]/15',
    badgeText: 'text-[#38BDF8]',
    borderColor: 'border-[#38BDF8]/40',
    accentColor: 'rgb(56, 189, 248)',
    description: 'Permanent Way, rails, ballast, sleepers, structural track geometry, and bridge girder inspection.',
    responsibilities: [
      'Track inspection & ultrasonic flaw detection',
      'Rail grinding, tamping & sleeper replacement',
      'Turnout & curve realignment',
      'Flash-butt rail joint weld repair'
    ],
    headOfficer: 'Senior Divisional Engineer (Sr. DEN / Cord)',
    crewBase: 'Central P-Way Depot, Station 01'
  },
  traction: {
    id: 'traction',
    name: 'Traction Distribution Department',
    shortName: 'Traction Dist.',
    code: 'TRD / OHE',
    color: '#F59E0B', // Amber / Orange
    badgeBg: 'bg-[#F59E0B]/15',
    badgeText: 'text-[#F59E0B]',
    borderColor: 'border-[#F59E0B]/40',
    accentColor: 'rgb(245, 158, 11)',
    description: '25kV AC Overhead Equipment (OHE), traction substations, section insulators, catenary & contact wire maintenance.',
    responsibilities: [
      'OHE contact & catenary wire height/stagger checking',
      'Cantilever assembly & insulator washing/replacement',
      'Power block electrical isolation & grounding',
      'Bonding, earth continuity & feeder cable inspection'
    ],
    headOfficer: 'Divisional Electrical Engineer (DEE / TRD)',
    crewBase: 'Traction Sub-Depot'
  },
  signaling: {
    id: 'signaling',
    name: 'Signal & Telecommunication',
    shortName: 'S&T Dept',
    code: 'S&T / SIG',
    color: '#C084FC', // Purple / Violet
    badgeBg: 'bg-[#C084FC]/15',
    badgeText: 'text-[#C084FC]',
    borderColor: 'border-[#C084FC]/40',
    accentColor: 'rgb(192, 132, 252)',
    description: 'Electronic Interlocking, axle counters, track circuits, point machines, OFC telecommunication cables, and block instruments.',
    responsibilities: [
      'Point machine stroke & lock testing',
      'Digital axle counter calibration',
      'Optical fiber cable (OFC) transmission testing',
      'Block proving equipment & telemetry checks'
    ],
    headOfficer: 'Senior Divisional Signal & Telecom Engineer (Sr. DSTE)',
    crewBase: 'Telecom Technical Center'
  }
};

export const SUB_BLOCKS: SubBlockData[] = [
  {
    id: 'SB-01',
    name: 'Station 01 Approach',
    chainageStartKm: 0.0,
    chainageEndKm: 4.8,
    trackType: '60 kg UIC continuous welded rail (CWR)',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Switch Diamond Crossing', 'Point Machine 101A/B', 'Yard OHE Portal 12'],
    maxPermissibleSpeed: 110
  },
  {
    id: 'SB-02',
    name: 'Curvature Section West',
    chainageStartKm: 4.8,
    chainageEndKm: 9.6,
    trackType: 'Curved 60 kg rail with check-rails',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Curvature Sensor 02', 'High-mast Cantilever C-08', 'Axle Counter Head 22'],
    maxPermissibleSpeed: 100
  },
  {
    id: 'SB-03',
    name: 'Mid-Corridor Approach',
    chainageStartKm: 9.6,
    chainageEndKm: 14.5,
    trackType: 'PSC Sleepers, 1660 density',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Neutral Section Insulator', 'Digital Axle Counter DAC-03', 'OFC Node #4'],
    maxPermissibleSpeed: 130
  },
  {
    id: 'SB-04',
    name: 'Viaduct Section North',
    chainageStartKm: 14.5,
    chainageEndKm: 19.5,
    trackType: 'Steel Girder bridge track with guard rails',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Bridge Expansion Joints', 'OHE Aerial Earth Wire', 'Submersible Cable Duct'],
    maxPermissibleSpeed: 90
  },
  {
    id: 'SB-05',
    name: 'Central Sector Link',
    chainageStartKm: 19.5,
    chainageEndKm: 24.5,
    trackType: 'Heavy haul standard CWR',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Auto Sectioning Post (SP-05)', 'Electronic Interlocking Rack 05', 'Track Circuit TC-51'],
    maxPermissibleSpeed: 130
  },
  {
    id: 'SB-06',
    name: 'Main Runway Sector',
    chainageStartKm: 24.5,
    chainageEndKm: 29.5,
    trackType: 'High-speed ballasted track',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['High-speed Turnout 1:16', 'Dropper Assembly Line 06', 'Block Panel BP-06'],
    maxPermissibleSpeed: 160
  },
  {
    id: 'SB-07',
    name: 'Bypass Junction Track',
    chainageStartKm: 29.5,
    chainageEndKm: 34.5,
    trackType: 'Double track standard mainline',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Feeder Wire Cross-arm', 'OFC Joint Chamber JC-19', 'Motorized Isolator Switch'],
    maxPermissibleSpeed: 130
  },
  {
    id: 'SB-08',
    name: 'Midway Crossover Block',
    chainageStartKm: 34.5,
    chainageEndKm: 39.5,
    trackType: 'Universal Crossover scissors geometry',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Scissors Crossover Points', 'Section Insulator SI-08', 'Audio Frequency Track Circuit'],
    maxPermissibleSpeed: 120
  },
  {
    id: 'SB-09',
    name: 'Station 02 Outskirts',
    chainageStartKm: 39.5,
    chainageEndKm: 44.5,
    trackType: 'Concrete sleeper mainline',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Traction Substation Feeder 09', 'Repeater Station R-09', 'Derailment Detection Ramp'],
    maxPermissibleSpeed: 130
  },
  {
    id: 'SB-10',
    name: 'Station 02 Terminal Section',
    chainageStartKm: 44.5,
    chainageEndKm: 49.0,
    trackType: 'Terminal station approach rails',
    oheVoltage: '25 kV AC 50 Hz Traction',
    criticalAssets: ['Electronic Interlocking Tower', 'OHE Tensioning Balance Weight', 'Axle Counter Evaluator'],
    maxPermissibleSpeed: 110
  }
];

/**
 * Realistic 24-Hour Schedule for all 3 Departments
 * As specified in user requirements:
 *
 * ENGINEERING:
 * 00:30–02:00 SB-02 Track Inspection
 * 03:00–05:00 SB-04 Track Repair
 * 06:30–08:00 SB-06 Track Defect Rectification
 * 09:00–11:00 SB-08 Track Maintenance
 * 12:30–14:30 SB-03 Rail Joint Welding
 * 15:30–17:30 SB-05 Ballast Tamping
 * 18:30–20:30 SB-07 Ultrasonic Flaw Detection
 * 21:30–23:30 SB-01 Turnout & Switch Grinding
 *
 * TRACTION DISTRIBUTION:
 * 01:00–03:00 SB-05 OHE Inspection
 * 04:00–05:30 SB-07 Electrical Maintenance
 * 07:00–09:00 SB-03 OHE Maintenance
 * 10:00–12:00 SB-09 OHE Inspection
 * 13:30–15:30 SB-06 Contact Wire Stagger Adjustment
 * 16:30–18:30 SB-02 Insulator Washing & Cleaning
 * 19:30–21:00 SB-04 Neutral Section Testing
 * 22:00–23:45 SB-08 25kV Feeder Maintenance
 *
 * S&T:
 * 02:00–03:30 SB-08 Telecom Inspection
 * 04:30–06:00 SB-04 Communication Maintenance
 * 08:00–10:00 SB-09 Telecom Maintenance
 * 11:00–13:00 SB-10 Telecom Infrastructure Work
 * 14:30–16:30 SB-07 Point Machine Maintenance
 * 17:30–19:00 SB-05 Digital Axle Counter Calibration
 * 20:00–21:45 SB-03 OFC Cable Link Maintenance
 * 22:30–23:55 SB-02 Telecom Power Backup Verification
 */
export const INITIAL_TASKS: MaintenanceTask[] = [
  // --- ENGINEERING ---
  {
    id: 'TASK-ENG-01',
    departmentId: 'engineering',
    subBlockId: 'SB-02',
    activity: 'Track Inspection',
    category: 'Track inspection',
    startMinutes: 30, // 00:30
    endMinutes: 120, // 02:00
    durationMinutes: 90,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 8,
    equipment: 'Track gauge trolley, ultrasonic rail probe',
    safetyProtocol: 'Track Inspection Possession'
  },
  {
    id: 'TASK-ENG-02',
    departmentId: 'engineering',
    subBlockId: 'SB-04',
    activity: 'Track Repair',
    category: 'Rail repair',
    startMinutes: 180, // 03:00
    endMinutes: 300, // 05:00
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 14,
    equipment: 'Flash-butt welding kit, rail profile grinder',
    safetyProtocol: 'Full Track Possession Block'
  },
  {
    id: 'TASK-ENG-03',
    departmentId: 'engineering',
    subBlockId: 'SB-06',
    activity: 'Track Defect Rectification',
    category: 'Track defect rectification',
    startMinutes: 390, // 06:30
    endMinutes: 480, // 08:00
    durationMinutes: 90,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 12,
    equipment: 'Hydraulic tamping unit, alignment gauge',
    safetyProtocol: 'Caution Speed Restriction (SR: 30 km/h)'
  },
  {
    id: 'TASK-ENG-04',
    departmentId: 'engineering',
    subBlockId: 'SB-08',
    activity: 'Track Maintenance',
    category: 'Track maintenance',
    startMinutes: 540, // 09:00
    endMinutes: 660, // 11:00
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 10,
    equipment: 'Sleeper replacement jack, ballast regulator',
    safetyProtocol: 'Corridor Traffic Gap Block'
  },
  {
    id: 'TASK-ENG-05',
    departmentId: 'engineering',
    subBlockId: 'SB-03',
    activity: 'Rail Joint Welding',
    category: 'Rail repair',
    startMinutes: 750, // 12:30
    endMinutes: 870, // 14:30
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 12,
    equipment: 'Thermite welding jig, rail profile straightedge',
    safetyProtocol: 'Track Block Possession'
  },
  {
    id: 'TASK-ENG-06',
    departmentId: 'engineering',
    subBlockId: 'SB-05',
    activity: 'Ballast Tamping',
    category: 'Track maintenance',
    startMinutes: 930, // 15:30
    endMinutes: 1050, // 17:30
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 10,
    equipment: 'Tamping express machine, laser levelling unit',
    safetyProtocol: 'Maintenance Block Window'
  },
  {
    id: 'TASK-ENG-07',
    departmentId: 'engineering',
    subBlockId: 'SB-07',
    activity: 'Ultrasonic Flaw Detection',
    category: 'Track inspection',
    startMinutes: 1110, // 18:30
    endMinutes: 1230, // 20:30
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 8,
    equipment: 'USFD digital rail tester, calibration probe',
    safetyProtocol: 'Track Possession Corridor'
  },
  {
    id: 'TASK-ENG-08',
    departmentId: 'engineering',
    subBlockId: 'SB-01',
    activity: 'Turnout & Switch Grinding',
    category: 'Rail repair',
    startMinutes: 1290, // 21:30
    endMinutes: 1410, // 23:30
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 14,
    equipment: 'Switch rail grinder, digital rail gauge',
    safetyProtocol: 'Night Yard Track Block'
  },

  // --- TRACTION DISTRIBUTION ---
  {
    id: 'TASK-TRD-01',
    departmentId: 'traction',
    subBlockId: 'SB-05',
    activity: 'OHE Inspection',
    category: 'OHE inspection',
    startMinutes: 60, // 01:00
    endMinutes: 180, // 03:00
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 6,
    equipment: 'Tower Wagon TW-401, laser height gauge',
    safetyProtocol: 'Power Block & Isolation Permit'
  },
  {
    id: 'TASK-TRD-02',
    departmentId: 'traction',
    subBlockId: 'SB-07',
    activity: 'Electrical Maintenance',
    category: 'Electrical equipment inspection',
    startMinutes: 240, // 04:00
    endMinutes: 330, // 05:30
    durationMinutes: 90,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 7,
    equipment: 'Insulation resistance megger, grounding discharge rods',
    safetyProtocol: 'Section Isolator Disconnected'
  },
  {
    id: 'TASK-TRD-03',
    departmentId: 'traction',
    subBlockId: 'SB-03',
    activity: 'OHE Maintenance',
    category: 'OHE maintenance',
    startMinutes: 420, // 07:00
    endMinutes: 540, // 09:00
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 8,
    equipment: 'Cantilever adjustment winch, dropper replacement set',
    safetyProtocol: 'OHE Power Block Section 03'
  },
  {
    id: 'TASK-TRD-04',
    departmentId: 'traction',
    subBlockId: 'SB-09',
    activity: 'OHE Inspection',
    category: 'OHE inspection',
    startMinutes: 600, // 10:00
    endMinutes: 720, // 12:00
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 6,
    equipment: 'Tower Wagon TW-402, pantograph test gauge',
    safetyProtocol: 'Traction Line Inspection Window'
  },
  {
    id: 'TASK-TRD-05',
    departmentId: 'traction',
    subBlockId: 'SB-06',
    activity: 'Contact Wire Stagger Adjustment',
    category: 'OHE maintenance',
    startMinutes: 810, // 13:30
    endMinutes: 930, // 15:30
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 7,
    equipment: 'Optical stagger measurement sensor, wire tensioner',
    safetyProtocol: 'Overhead Power Isolation'
  },
  {
    id: 'TASK-TRD-06',
    departmentId: 'traction',
    subBlockId: 'SB-02',
    activity: 'Insulator Washing & Cleaning',
    category: 'Electrical equipment inspection',
    startMinutes: 990, // 16:30
    endMinutes: 1110, // 18:30
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 6,
    equipment: 'De-mineralized water jet washer, ladder trolley',
    safetyProtocol: 'Shadow Power Block'
  },
  {
    id: 'TASK-TRD-07',
    departmentId: 'traction',
    subBlockId: 'SB-04',
    activity: 'Neutral Section Testing',
    category: 'Electrical equipment inspection',
    startMinutes: 1170, // 19:30
    endMinutes: 1260, // 21:00
    durationMinutes: 90,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 8,
    equipment: 'Neutral section runner gauge, arc trap tester',
    safetyProtocol: 'Substation Feeder Lockout'
  },
  {
    id: 'TASK-TRD-08',
    departmentId: 'traction',
    subBlockId: 'SB-08',
    activity: '25kV Feeder Maintenance',
    category: 'OHE maintenance',
    startMinutes: 1320, // 22:00
    endMinutes: 1425, // 23:45
    durationMinutes: 105,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 7,
    equipment: 'Feeder wire winch, high voltage tester',
    safetyProtocol: 'Night Feeder Line Block'
  },

  // --- S&T (SIGNAL & TELECOMMUNICATION) ---
  {
    id: 'TASK-SNT-01',
    departmentId: 'signaling',
    subBlockId: 'SB-08',
    activity: 'Telecom Inspection',
    category: 'Telecom infrastructure inspection',
    startMinutes: 120, // 02:00
    endMinutes: 210, // 03:30
    durationMinutes: 90,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 5,
    equipment: 'OTDR fiber tester, spectrum analyzer',
    safetyProtocol: 'Telecom Shadow Access'
  },
  {
    // Overlaps with Engineering on SB-04 (03:00–05:00) during 04:30–05:00!
    id: 'TASK-SNT-02',
    departmentId: 'signaling',
    subBlockId: 'SB-04',
    activity: 'Communication Maintenance',
    category: 'Telecom/cable inspection',
    startMinutes: 270, // 04:30
    endMinutes: 360, // 06:00
    durationMinutes: 90,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 6,
    equipment: 'Optical power meter, cable locator, digital multimeters',
    safetyProtocol: 'Corridor Signal Cable Memo',
    isConflicted: true,
    conflictWithTaskId: 'TASK-ENG-02',
    originalStartMinutes: 270,
    originalSubBlockId: 'SB-04'
  },
  {
    id: 'TASK-SNT-03',
    departmentId: 'signaling',
    subBlockId: 'SB-09',
    activity: 'Telecom Maintenance',
    category: 'Cable maintenance',
    startMinutes: 480, // 08:00
    endMinutes: 600, // 10:00
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 6,
    equipment: 'Fusion splicer, fiber cleaning kit, OTDR',
    safetyProtocol: 'OFC Trackside Access Permit'
  },
  {
    id: 'TASK-SNT-04',
    departmentId: 'signaling',
    subBlockId: 'SB-10',
    activity: 'Telecom Infrastructure Work',
    category: 'Telecom infrastructure inspection',
    startMinutes: 660, // 11:00
    endMinutes: 780, // 13:00
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 8,
    equipment: 'Data logger diagnostic laptop, microwave link analyzer',
    safetyProtocol: 'Terminal Telecom Interlock Permit'
  },
  {
    id: 'TASK-SNT-05',
    departmentId: 'signaling',
    subBlockId: 'SB-07',
    activity: 'Point Machine Maintenance',
    category: 'S&T equipment maintenance',
    startMinutes: 870, // 14:30
    endMinutes: 990, // 16:30
    durationMinutes: 120,
    status: 'UPCOMING',
    priority: 'High',
    crewCount: 7,
    equipment: 'Point gauge feelers, stroke adjustment tool',
    safetyProtocol: 'Point Motor Clamped Normal'
  },
  {
    id: 'TASK-SNT-06',
    departmentId: 'signaling',
    subBlockId: 'SB-05',
    activity: 'Digital Axle Counter Calibration',
    category: 'S&T equipment maintenance',
    startMinutes: 1050, // 17:30
    endMinutes: 1140, // 19:00
    durationMinutes: 90,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 5,
    equipment: 'DAC evaluator probe, dummy wheel flange tester',
    safetyProtocol: 'Non-interfering S&T Shadow Block'
  },
  {
    id: 'TASK-SNT-07',
    departmentId: 'signaling',
    subBlockId: 'SB-03',
    activity: 'OFC Cable Link Maintenance',
    category: 'Cable maintenance',
    startMinutes: 1200, // 20:00
    endMinutes: 1305, // 21:45
    durationMinutes: 105,
    status: 'UPCOMING',
    priority: 'Medium',
    crewCount: 6,
    equipment: 'OFC joint enclosure kit, fiber attenuation meter',
    safetyProtocol: 'Trackside Trench Permit'
  },
  {
    id: 'TASK-SNT-08',
    departmentId: 'signaling',
    subBlockId: 'SB-02',
    activity: 'Telecom Power Backup Verification',
    category: 'Telecom infrastructure inspection',
    startMinutes: 1350, // 22:30
    endMinutes: 1435, // 23:55
    durationMinutes: 85,
    status: 'UPCOMING',
    priority: 'Low',
    crewCount: 4,
    equipment: 'Battery load bank tester, UPS diagnostics kit',
    safetyProtocol: 'Relay Room Access Only'
  }
];

export const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'log-init-1',
    timestampMinutes: 0,
    timeFormatted: '00:00',
    departmentId: 'engineering' as DepartmentId,
    subBlockId: 'SB-01',
    type: 'ENTRY' as const,
    message: 'Engineering P-Way crew initialized standby at Station 01 for corridor maintenance cycle.'
  },
  {
    id: 'log-init-2',
    timestampMinutes: 5,
    timeFormatted: '00:05',
    departmentId: 'traction' as DepartmentId,
    subBlockId: 'SB-05',
    type: 'ENTRY' as const,
    message: 'Traction Distribution crew on standby for scheduled 25kV OHE power block.'
  },
  {
    id: 'log-init-3',
    timestampMinutes: 10,
    timeFormatted: '00:10',
    departmentId: 'signaling' as DepartmentId,
    subBlockId: 'SB-08',
    type: 'ENTRY' as const,
    message: 'S&T technical unit ready for telecom and interlocking diagnostics.'
  }
];

/**
 * Background Scheduled Operations (Trains)
 * Note: Trains are NOT visually displayed on the map.
 * They run internally in background logic to compute operational impacts and calculate
 * alternative track routes, delays, or rescheduling.
 */
export const INITIAL_OPERATIONS: ScheduledOperation[] = [
  {
    id: 'OP-01',
    name: 'Scheduled Intercity Express (04:30)',
    type: 'Superfast Express',
    origin: 'Station 01',
    destination: 'Station 02',
    scheduledTimeMinutes: 270, // 04:30
    durationMinutes: 50,
    primaryTrack: 1,
    pathSubBlockIds: ['SB-01', 'SB-02', 'SB-03', 'SB-04', 'SB-05'],
    alternativeTrack: 2,
    alternativePathSubBlockIds: ['SB-01', 'SB-02', 'SB-07', 'SB-08', 'SB-09', 'SB-10'],
    priorityLevel: 'SUPERFAST',
    impactStatus: 'NORMAL'
  },
  {
    id: 'OP-02',
    name: 'Morning Express (08:30)',
    type: 'Vande Bharat',
    origin: 'Station 01',
    destination: 'Station 02',
    scheduledTimeMinutes: 510, // 08:30
    durationMinutes: 45,
    primaryTrack: 1,
    pathSubBlockIds: ['SB-01', 'SB-02', 'SB-03', 'SB-04', 'SB-05'],
    alternativeTrack: 2,
    alternativePathSubBlockIds: ['SB-01', 'SB-02', 'SB-07', 'SB-08', 'SB-09', 'SB-10'],
    priorityLevel: 'CRITICAL_EXPRESS',
    impactStatus: 'NORMAL'
  },
  {
    id: 'OP-03',
    name: 'Day Freight Service (13:00)',
    type: 'Freight Container',
    origin: 'Station 02',
    destination: 'Station 01',
    scheduledTimeMinutes: 780, // 13:00
    durationMinutes: 60,
    primaryTrack: 1,
    pathSubBlockIds: ['SB-01', 'SB-02', 'SB-03', 'SB-04', 'SB-05'],
    alternativeTrack: 2,
    alternativePathSubBlockIds: ['SB-06', 'SB-07', 'SB-08', 'SB-09', 'SB-10'],
    priorityLevel: 'FREIGHT',
    impactStatus: 'NORMAL'
  },
  {
    id: 'OP-04',
    name: 'Afternoon Intercity (16:00)',
    type: 'Superfast Express',
    origin: 'Station 01',
    destination: 'Station 02',
    scheduledTimeMinutes: 960, // 16:00
    durationMinutes: 45,
    primaryTrack: 1,
    pathSubBlockIds: ['SB-01', 'SB-02', 'SB-03', 'SB-04', 'SB-05'],
    alternativeTrack: 2,
    alternativePathSubBlockIds: ['SB-06', 'SB-07', 'SB-08', 'SB-09', 'SB-10'],
    priorityLevel: 'SUPERFAST',
    impactStatus: 'NORMAL'
  },
  {
    id: 'OP-05',
    name: 'Evening Express (20:00)',
    type: 'Superfast Express',
    origin: 'Station 01',
    destination: 'Station 02',
    scheduledTimeMinutes: 1200, // 20:00
    durationMinutes: 50,
    primaryTrack: 1,
    pathSubBlockIds: ['SB-01', 'SB-02', 'SB-03', 'SB-04', 'SB-05'],
    alternativeTrack: 2,
    alternativePathSubBlockIds: ['SB-06', 'SB-07', 'SB-08', 'SB-09', 'SB-10'],
    priorityLevel: 'SUPERFAST',
    impactStatus: 'NORMAL'
  }
];
