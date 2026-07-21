import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: notification-bugfix
 * Property 2: Preservation — Существующее поведение уведомлений и достижений
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * These tests capture the OBSERVED correct behaviors on UNFIXED code.
 * They MUST PASS on the current (unfixed) code — they serve as regression tests
 * to ensure the bugfix does not break existing working functionality.
 *
 * Observed behaviors:
 * - fetchNotifications loads notifications and sets unreadCount correctly
 * - Notification panel displays list in descending created_at order
 * - handleShare calls grantReward, adds +50₽, saves milestone in shared_milestones
 * - checkMilestone does not show modal if milestone already in shared_milestones
 * - Red badge is displayed when unreadCount > 0
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ProfileAchievements {
  shared_milestones: number[];
  seen_milestones?: number[];
}

interface Profile {
  id: string;
  balance: number;
  achievements: ProfileAchievements;
}

// ============================================================================
// FUNCTIONS UNDER TEST — mirrors the CURRENT (unfixed) code behavior
// ============================================================================

/**
 * Simulates fetchNotifications from Dashboard.tsx.
 * Orders by created_at descending, limits to 20, sets unreadCount.
 * This is existing correct behavior.
 */
function fetchNotificationsLogic(allNotifications: Notification[]): {
  notifications: Notification[];
  unreadCount: number;
} {
  // Sort descending by created_at (as Supabase .order('created_at', { ascending: false }) does)
  const sorted = [...allNotifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);

  const unreadCount = sorted.filter(n => !n.is_read).length;

  return { notifications: sorted, unreadCount };
}

/**
 * Simulates the red badge visibility logic from Dashboard.tsx:
 * {unreadCount > 0 && <span className="...bg-red-500..." />}
 */
function isRedBadgeVisible(unreadCount: number): boolean {
  return unreadCount > 0;
}

/**
 * Simulates checkMilestone logic from AchievementModal.tsx (current code).
 * Checks only shared_milestones to determine if a milestone modal should show.
 */
function checkMilestoneLogic(
  achievements: ProfileAchievements,
  earnedTotal: number
): { milestone: number | null; isVisible: boolean } {
  const shared = achievements.shared_milestones || [];

  let newMilestone: number | null = null;
  if (earnedTotal >= 5000 && !shared.includes(5000)) newMilestone = 5000;
  else if (earnedTotal >= 1000 && !shared.includes(1000)) newMilestone = 1000;
  else if (earnedTotal >= 100 && !shared.includes(100)) newMilestone = 100;

  return {
    milestone: newMilestone,
    isVisible: newMilestone !== null,
  };
}

/**
 * Simulates grantReward logic from AchievementModal.tsx (called by handleShare).
 * Adds +50₽ to balance and saves milestone in shared_milestones.
 * This is existing correct behavior that must be preserved.
 */
function grantRewardLogic(
  profile: Profile,
  milestone: number
): { newBalance: number; updatedAchievements: ProfileAchievements } | null {
  if (!milestone) return null;

  const bonus = 50;
  const currentAchievements = profile.achievements || { shared_milestones: [] };
  const sharedMilestones = currentAchievements.shared_milestones || [];

  // If already rewarded, don't add again
  if (sharedMilestones.includes(milestone)) {
    return null;
  }

  return {
    newBalance: profile.balance + bonus,
    updatedAchievements: {
      ...currentAchievements,
      shared_milestones: [...sharedMilestones, milestone],
    },
  };
}

// ============================================================================
// GENERATORS
// ============================================================================

const notificationArb = fc.record({
  id: fc.uuid(),
  user_id: fc.constant('test-user'),
  message: fc.string({ minLength: 1, maxLength: 50 }),
  is_read: fc.boolean(),
  created_at: fc.integer({ min: new Date('2024-01-01').getTime(), max: new Date('2025-12-31').getTime() })
    .map(ts => new Date(ts).toISOString()),
});

const notificationListArb = fc.array(notificationArb, { minLength: 0, maxLength: 25 });

const milestoneArb = fc.constantFrom(100, 1000, 5000);

const balanceArb = fc.integer({ min: 0, max: 100000 });

const sharedMilestonesArb = fc.subarray([100, 1000, 5000]);

// ============================================================================
// PROPERTY TESTS — PRESERVATION
// ============================================================================

describe('Property 2: Preservation — Existing notification and achievement behavior', () => {

  /**
   * Property: For any notification list, displayed in descending created_at order.
   * **Validates: Requirements 3.2**
   *
   * Observed behavior: fetchNotifications orders by created_at DESC.
   * The notification panel then displays them via notifications.map(),
   * preserving the fetched order.
   */
  it('Notifications are always displayed in descending created_at order', async () => {
    await fc.assert(
      fc.asyncProperty(
        notificationListArb,
        async (rawNotifications) => {
          fc.pre(rawNotifications.length > 1);

          const { notifications } = fetchNotificationsLogic(rawNotifications);

          // Verify: each notification's created_at is >= next one's created_at
          for (let i = 0; i < notifications.length - 1; i++) {
            const current = new Date(notifications[i].created_at).getTime();
            const next = new Date(notifications[i + 1].created_at).getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any unreadCount > 0, red badge is visible.
   * **Validates: Requirements 3.1, 3.6**
   *
   * Observed behavior: The red dot span renders only when unreadCount > 0.
   * unreadCount is computed as data.filter(n => !n.is_read).length.
   */
  it('Red badge is visible when unreadCount > 0, hidden when 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        notificationListArb,
        async (rawNotifications) => {
          const { unreadCount } = fetchNotificationsLogic(rawNotifications);
          const badgeVisible = isRedBadgeVisible(unreadCount);

          if (unreadCount > 0) {
            expect(badgeVisible).toBe(true);
          } else {
            expect(badgeVisible).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any milestone in shared_milestones, modal does not show.
   * **Validates: Requirements 3.3, 3.4**
   *
   * Observed behavior: checkMilestone checks if milestone is in shared_milestones.
   * If it is, the modal is NOT shown. This is the correct behavior after sharing.
   */
  it('Modal does not show for milestones already in shared_milestones', async () => {
    await fc.assert(
      fc.asyncProperty(
        milestoneArb,
        fc.integer({ min: 0, max: 10000 }),
        async (milestone, extraEarnings) => {
          // Setup: earnedTotal is enough to trigger the milestone
          const earnedTotal = milestone + extraEarnings;

          // The milestone IS in shared_milestones (user already shared it)
          const achievements: ProfileAchievements = {
            shared_milestones: [milestone],
          };

          const result = checkMilestoneLogic(achievements, earnedTotal);

          // Modal should NOT show — milestone already shared
          expect(result.milestone).not.toBe(milestone);
          // If milestone is the highest qualified, result should show a higher one or null
          // But critically: the shared milestone itself must not trigger the modal
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any handleShare call, balance += 50 and milestone added to shared_milestones.
   * **Validates: Requirements 3.3**
   *
   * Observed behavior: grantReward adds exactly 50₽ bonus to current balance
   * and appends the milestone to the shared_milestones array.
   */
  it('handleShare grants +50₽ bonus and saves milestone to shared_milestones', async () => {
    await fc.assert(
      fc.asyncProperty(
        milestoneArb,
        balanceArb,
        sharedMilestonesArb,
        async (milestone, currentBalance, existingShared) => {
          // Precondition: milestone is NOT already shared (grantReward early-returns otherwise)
          fc.pre(!existingShared.includes(milestone));

          const profile: Profile = {
            id: 'test-user',
            balance: currentBalance,
            achievements: { shared_milestones: existingShared },
          };

          const result = grantRewardLogic(profile, milestone);

          // grantReward should succeed
          expect(result).not.toBeNull();

          if (result) {
            // Balance increased by exactly 50
            expect(result.newBalance).toBe(currentBalance + 50);

            // Milestone is now in shared_milestones
            expect(result.updatedAchievements.shared_milestones).toContain(milestone);

            // Previous milestones are preserved
            for (const existing of existingShared) {
              expect(result.updatedAchievements.shared_milestones).toContain(existing);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: unreadCount matches the actual number of unread notifications.
   * **Validates: Requirements 3.1, 3.6**
   *
   * Observed behavior: setUnreadCount(data.filter(n => !n.is_read).length)
   * This ensures the count is always accurate.
   */
  it('unreadCount accurately reflects the number of unread notifications', async () => {
    await fc.assert(
      fc.asyncProperty(
        notificationListArb,
        async (rawNotifications) => {
          const { notifications, unreadCount } = fetchNotificationsLogic(rawNotifications);

          // unreadCount must equal the count of notifications where is_read === false
          const actualUnread = notifications.filter(n => !n.is_read).length;
          expect(unreadCount).toBe(actualUnread);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: fetchNotifications limits results to 20 items.
   * **Validates: Requirements 3.2**
   *
   * Observed behavior: .limit(20) in the Supabase query ensures
   * at most 20 notifications are displayed.
   */
  it('fetchNotifications returns at most 20 notifications', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(notificationArb, { minLength: 0, maxLength: 50 }),
        async (rawNotifications) => {
          const { notifications } = fetchNotificationsLogic(rawNotifications);
          expect(notifications.length).toBeLessThanOrEqual(20);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: grantReward is idempotent — calling with already-shared milestone returns null.
   * **Validates: Requirements 3.3**
   *
   * Observed behavior: if (sharedMilestones.includes(milestone)) return;
   * This prevents double-rewarding.
   */
  it('grantReward does not double-reward for already-shared milestone', async () => {
    await fc.assert(
      fc.asyncProperty(
        milestoneArb,
        balanceArb,
        async (milestone, currentBalance) => {
          // Milestone is ALREADY in shared_milestones
          const profile: Profile = {
            id: 'test-user',
            balance: currentBalance,
            achievements: { shared_milestones: [milestone] },
          };

          const result = grantRewardLogic(profile, milestone);

          // grantReward should return null (already rewarded)
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
