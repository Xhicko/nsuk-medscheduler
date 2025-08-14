import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a human-friendly Medical ID.
 * Pattern: `${prefix}-${YY}-${NNNNNN}` (e.g., MED-25-123456)
 * - prefix: default 'MED' to match existing UI fallbacks
 * - YY: last two digits of the year
 * - NNNNNN: 6-digit random number
 */
export function generateMedicalId(prefix = 'NSUK/MED') {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}/${yy}/${rand}`
}
