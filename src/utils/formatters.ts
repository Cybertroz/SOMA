/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a Kenyan Shilling currency value consistently across the platform.
 * Follows the standard convention: KES 4.43M, KES 22.10M, KES 14.80M, or KES 28,500.
 */
export function formatCurrencyKES(amount: number, compact: boolean = true): string {
  if (isNaN(amount) || amount === 0) return 'KES 0';
  
  if (compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000) {
      const millions = amount / 1_000_000;
      return `KES ${millions.toFixed(2)}M`;
    }
    if (abs >= 100_000) {
      const thousands = amount / 1_000;
      return `KES ${(amount / 1_000_000).toFixed(2)}M`;
    }
  }

  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

/**
 * Formats currency in full comma-delimited notation: KES 1,480,000
 */
export function formatCurrencyFull(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'KES 0';
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

/**
 * Formats percentages with clean one decimal precision: 95.4%
 */
export function formatPercent(val: number): string {
  if (isNaN(val)) return '0%';
  return `${val.toFixed(1).replace(/\.0$/, '')}%`;
}
