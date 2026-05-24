/**
 * Converts a 7-char hex color (#RRGGBB) into an `rgba(...)` string with the
 * given alpha. Used to derive `--accent-bg` / `--accent-border` from a base
 * accent color at runtime.
 */
export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
