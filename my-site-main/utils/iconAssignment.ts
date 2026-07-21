/**
 * Assigns unique icons from a pool to a list of items.
 * Ensures no two items receive the same icon when items.length > 3.
 *
 * @param items - Array of item labels/identifiers to assign icons to
 * @param iconPool - Array of available icon identifiers to choose from
 * @returns Array of unique icon identifiers, one per item
 * @throws Error if iconPool has fewer unique icons than items.length
 */
export function assignUniqueIcons(items: string[], iconPool: string[]): string[] {
  const uniquePool = [...new Set(iconPool)];

  if (uniquePool.length < items.length) {
    throw new Error(
      `Icon pool has ${uniquePool.length} unique icons but ${items.length} items require assignment`
    );
  }

  const assigned: string[] = [];
  const used = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    // Deterministic selection: pick from unused pool based on index
    const available = uniquePool.filter((icon) => !used.has(icon));
    const icon = available[i % available.length];
    assigned.push(icon);
    used.add(icon);
  }

  return assigned;
}

/**
 * Default pool of Lucide icon names available for list items.
 * This pool is large enough to support lists of up to 20 items.
 */
export const LUCIDE_ICON_POOL: string[] = [
  'check-circle',
  'star',
  'zap',
  'shield',
  'target',
  'award',
  'trending-up',
  'heart',
  'thumbs-up',
  'rocket',
  'lightbulb',
  'gem',
  'crown',
  'flame',
  'sparkles',
  'bolt',
  'globe',
  'compass',
  'flag',
  'medal',
  'trophy',
  'diamond',
  'sunrise',
  'mountain',
];
