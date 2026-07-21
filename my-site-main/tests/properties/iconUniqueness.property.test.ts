import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { assignUniqueIcons, LUCIDE_ICON_POOL } from '../../utils/iconAssignment';

/**
 * Feature: premium-redesign, Property 8: List icon uniqueness for groups larger than 3
 * Validates: Requirements 4.5
 *
 * For any list of N > 3 items rendered with icons, all icon identifiers within
 * that list SHALL be unique (no two items share the same icon).
 */
describe('Property 8: List icon uniqueness for groups larger than 3', () => {
  // Generator for icon names (simulating a pool of available Lucide icons)
  const iconName = fc.stringMatching(/^[a-z][a-z0-9-]{2,20}$/);

  it('for any assignment of icons to N > 3 items, all assigned icons must be unique (no duplicates)', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(iconName, { minLength: 4, maxLength: 20 }),
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 4, maxLength: 20 }),
        (iconPool, items) => {
          // Ensure pool is at least as large as items
          if (iconPool.length < items.length) return; // skip: precondition not met

          const assigned = assignUniqueIcons(items, iconPool);
          const uniqueAssigned = new Set(assigned);

          // All assigned icons must be unique
          expect(uniqueAssigned.size).toBe(assigned.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('assignUniqueIcons returns exactly items.length icons', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(iconName, { minLength: 4, maxLength: 20 }),
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 4, maxLength: 20 }),
        (iconPool, items) => {
          if (iconPool.length < items.length) return;

          const assigned = assignUniqueIcons(items, iconPool);

          // Must return exactly one icon per item
          expect(assigned.length).toBe(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each returned icon is from the provided pool', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(iconName, { minLength: 4, maxLength: 20 }),
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 4, maxLength: 20 }),
        (iconPool, items) => {
          if (iconPool.length < items.length) return;

          const assigned = assignUniqueIcons(items, iconPool);
          const poolSet = new Set(iconPool);

          // Every assigned icon must come from the pool
          for (const icon of assigned) {
            expect(poolSet.has(icon)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('the default LUCIDE_ICON_POOL has at least 20 unique icons to support lists up to 20 items', () => {
    const uniqueIcons = new Set(LUCIDE_ICON_POOL);
    expect(uniqueIcons.size).toBeGreaterThanOrEqual(20);
  });

  it('assignUniqueIcons works correctly with the default LUCIDE_ICON_POOL for any list size 4-20', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 4, max: 20 }),
        (listSize) => {
          const items = Array.from({ length: listSize }, (_, i) => `item-${i}`);
          const assigned = assignUniqueIcons(items, LUCIDE_ICON_POOL);

          // Correct count
          expect(assigned.length).toBe(listSize);

          // All unique
          const uniqueAssigned = new Set(assigned);
          expect(uniqueAssigned.size).toBe(listSize);

          // All from pool
          const poolSet = new Set(LUCIDE_ICON_POOL);
          for (const icon of assigned) {
            expect(poolSet.has(icon)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
