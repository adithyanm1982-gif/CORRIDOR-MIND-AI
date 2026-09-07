import { SimulationDashboard } from '@/features/simulation/SimulationDashboard';

/**
 * The /simulation route. As of this rewrite, this is a direct port of
 * a separately-built standalone simulation project the user confirmed
 * is exactly correct -- see features/simulation/SimulationDashboard.tsx
 * for the one adaptation made (h-screen -> h-full, to fit this route's
 * content area rather than assuming the full browser viewport).
 */
export function SimulationPage() {
  return <SimulationDashboard />;
}
