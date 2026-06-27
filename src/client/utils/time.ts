/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts estimated time in minutes to a user-friendly string format.
 * Examples:
 * - 30 -> "30m"
 * - 60 -> "1h"
 * - 120 -> "2h"
 * - 150 -> "2h 30m"
 * - 375 -> "6h 15m"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours === 0) {
    return `${remainingMins}m`;
  }
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
}

/**
 * Parses hours and minutes into total minutes.
 */
export function parseDuration(hours: number, minutes: number): number {
  return (Math.max(0, hours) * 60) + Math.max(0, minutes);
}

// Keep formatEffort alias for backwards compatibility across any other references
export const formatEffort = formatDuration;
