/**
 * Formats a play or view count into a compact, stylish string
 * Examples:
 * 45 -> "45"
 * 1250 -> "1.3K"
 * 45200 -> "45.2K"
 * 1200000 -> "1.2M"
 */
export function formatPlays(plays: number = 0): string {
  if (isNaN(plays) || plays <= 0) return '0';
  if (plays >= 1_000_000) {
    return `${(plays / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (plays >= 1_000) {
    return `${(plays / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return plays.toLocaleString('es-PE');
}

