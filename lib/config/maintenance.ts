/**
 * DayDream Maintenance Mode Configuration
 *
 * HOW TO USE:
 * ============================================================================
 * • To turn Maintenance Mode ON:
 *     Change MAINTENANCE_MODE to true:
 *       export const MAINTENANCE_MODE: boolean = true;
 *
 * • To turn Maintenance Mode OFF:
 *     Change MAINTENANCE_MODE to false:
 *       export const MAINTENANCE_MODE: boolean = false;
 *
 * You can also control this via environment variables (e.g. in .env or Vercel):
 *     MAINTENANCE_MODE=true
 * ============================================================================
 */

export const MAINTENANCE_MODE: boolean = false;

/**
 * Checks if Maintenance Mode is active (either via code constant or env var).
 */
export function isMaintenanceMode(): boolean {
  if (
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true"
  ) {
    return true;
  }
  return MAINTENANCE_MODE;
}
