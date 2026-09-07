/**
 * Utility functions for time conversions and calculations
 * 0 minutes = 00:00, 1440 minutes = 24:00
 */

export function minutesToTimeString(minutes: number): string {
  const clamped = Math.max(0, Math.min(1440, Math.floor(minutes)));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  const hh = hours.toString().padStart(2, '0');
  const mm = mins.toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function calculateProgress(currentMinutes: number, startMinutes: number, endMinutes: number): number {
  if (currentMinutes < startMinutes) return 0;
  if (currentMinutes >= endMinutes) return 100;
  const total = endMinutes - startMinutes;
  if (total <= 0) return 100;
  const elapsed = currentMinutes - startMinutes;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function getTimePhase(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  if (hour >= 0 && hour < 5) return 'Night Mega-Block Window';
  if (hour >= 5 && hour < 10) return 'Morning Traffic Inspection Window';
  if (hour >= 10 && hour < 15) return 'Integrated Shadow Maintenance Window';
  if (hour >= 15 && hour < 20) return 'Afternoon Corridor Maintenance Window';
  return 'Night-Shift Prep Window';
}
