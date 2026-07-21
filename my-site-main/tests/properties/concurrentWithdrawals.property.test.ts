import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { executeWithdrawal } from '../../utils/transactions';

/**
 * Feature: premium-redesign, Property 12: Concurrent withdrawals cannot exceed initial balance
 * Validates: Requirements 7.2
 *
 * For any initial balance B ≥ 0 and any set of concurrent withdrawal requests
 * with amounts [a1, a2, ..., aN], the total amount successfully withdrawn
 * SHALL NOT exceed B, ensuring the final balance is always ≥ 0.
 */

/**
 * Creates a mock Supabase client with shared mutable state that simulates
 * proper race condition prevention at the database level.
 *
 * The mock uses a conditional update pattern to simulate how a real
 * database prevents race conditions:
 * - Balance updates only succeed if the new balance can be achieved
 *   from the CURRENT state (not a stale read).
 * - Specifically: UPDATE profiles SET balance = $new WHERE balance = $expected
 *   The "expected" is implicitly (newBalance + amount), verified against current state.
 *
 * This ensures that if two concurrent withdrawals both read balance=X,
 * only the first update succeeds. The second fails because the balance
 * has already changed, triggering a rollback in executeWithdrawal.
 */
function createMockSupabaseClient(initialBalance: number) {
  const state = {
    balance: initialBalance,
    withdrawals: [] as Array<{ id: string; amount: number }>,
    nextId: 1,
  };

  // Track the last balance value read. Each select().eq().single() call
  // updates this. Since executeWithdrawal does a recheck read immediately
  // before the update, this captures what the caller "expects" the balance to be.
  let lastReadBalance = initialBalance;

  const client = {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: 'test-user' } } },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: (_columns?: string) => ({
            eq: (_column: string, _value: unknown) => ({
              single: async () => {
                // Record what the caller read
                lastReadBalance = state.balance;
                return {
                  data: { balance: state.balance },
                  error: null,
                };
              },
            }),
          }),
          insert: (_record: unknown) => ({
            select: (_columns?: string) => ({
              single: async () => ({ data: null, error: { message: 'not used' } }),
            }),
          }),
          update: (values: { balance: number }) => ({
            eq: async (_column: string, _value: unknown) => {
              const proposedBalance = values.balance;

              // Reject if balance would be negative
              if (proposedBalance < 0) {
                return { data: null, error: { message: 'CHECK constraint: balance >= 0' } };
              }

              // Simulate conditional update (optimistic locking):
              // The caller computed proposedBalance = readBalance - amount
              // So readBalance = proposedBalance + amount
              // The update only succeeds if the current balance hasn't changed
              // since the caller's last read (i.e., no concurrent modification).
              //
              // In SQL this would be:
              //   UPDATE profiles SET balance = $proposed
              //   WHERE id = $id AND balance = $expectedCurrent
              //
              // The expected current is what was read. If state.balance differs
              // from what was read, another transaction modified it.
              const expectedCurrent = lastReadBalance;
              if (state.balance !== expectedCurrent) {
                return { data: null, error: { message: 'Conflict: balance modified concurrently' } };
              }

              state.balance = proposedBalance;
              return { data: { balance: state.balance }, error: null };
            },
          }),
          delete: () => ({
            eq: async (_column: string, value: unknown) => {
              state.withdrawals = state.withdrawals.filter((w) => w.id !== value);
              return { data: null, error: null };
            },
          }),
        };
      }

      if (table === 'withdrawals') {
        return {
          select: (_columns?: string) => ({
            eq: (_column: string, _value: unknown) => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
          insert: (record: { amount: number }) => ({
            select: (_columns?: string) => ({
              single: async () => {
                const id = `w-${state.nextId++}`;
                const withdrawal = {
                  id,
                  user_id: 'test-user',
                  amount: record.amount,
                  method: 'card',
                  requisites: '12345678',
                  status: 'pending' as const,
                  created_at: new Date().toISOString(),
                };
                state.withdrawals.push({ id, amount: record.amount });
                return { data: withdrawal, error: null };
              },
            }),
          }),
          update: (_values: unknown) => ({
            eq: async (_column: string, _value: unknown) => ({ data: null, error: null }),
          }),
          delete: () => ({
            eq: async (_column: string, value: unknown) => {
              state.withdrawals = state.withdrawals.filter((w) => w.id !== value);
              return { data: null, error: null };
            },
          }),
        };
      }

      // Default fallback for other tables
      return {
        select: (_columns?: string) => ({
          eq: (_column: string, _value: unknown) => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        insert: (_record: unknown) => ({
          select: (_columns?: string) => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: (_values: unknown) => ({
          eq: async (_column: string, _value: unknown) => ({ data: null, error: null }),
        }),
        delete: () => ({
          eq: async (_column: string, _value: unknown) => ({ data: null, error: null }),
        }),
      };
    },
  };

  return { client, state };
}

describe('Property 12: Concurrent withdrawals cannot exceed initial balance', () => {
  it('total amount successfully withdrawn never exceeds initial balance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 0, max: 100000, noNaN: true }).map((b) => Math.round(b * 100) / 100),
        fc.array(
          fc.double({ min: 0.01, max: 999999.99, noNaN: true }).map((a) => Math.round(a * 100) / 100),
          { minLength: 2, maxLength: 10 }
        ),
        async (initialBalance, amounts) => {
          const { client, state } = createMockSupabaseClient(initialBalance);

          // Run all withdrawals concurrently using Promise.all
          const results = await Promise.all(
            amounts.map((amount) =>
              executeWithdrawal(
                {
                  userId: 'test-user',
                  amount,
                  method: 'card',
                  requisites: '12345678',
                },
                client as never
              )
            )
          );

          // Calculate total successfully withdrawn
          const totalWithdrawn = results
            .filter((r) => r.success)
            .reduce((sum, r) => sum + (r.data?.amount ?? 0), 0);

          // Property: total withdrawn must not exceed initial balance
          // Using floating point tolerance
          expect(totalWithdrawn).toBeLessThanOrEqual(initialBalance + 0.005);

          // Property: final balance must be >= 0
          expect(state.balance).toBeGreaterThanOrEqual(-0.005);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('final balance is always non-negative after concurrent withdrawals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 10, max: 50000, noNaN: true }).map((b) => Math.round(b * 100) / 100),
        fc.array(
          fc.double({ min: 0.01, max: 1000, noNaN: true }).map((a) => Math.round(a * 100) / 100),
          { minLength: 2, maxLength: 8 }
        ),
        async (initialBalance, amounts) => {
          const { client, state } = createMockSupabaseClient(initialBalance);

          // Run all withdrawals concurrently
          await Promise.all(
            amounts.map((amount) =>
              executeWithdrawal(
                {
                  userId: 'test-user',
                  amount,
                  method: 'card',
                  requisites: '12345678',
                },
                client as never
              )
            )
          );

          // Property: final balance must always be >= 0
          expect(state.balance).toBeGreaterThanOrEqual(-0.005);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when all requested amounts sum exceeds balance, at least one withdrawal is rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.double({ min: 1, max: 1000, noNaN: true }).map((b) => Math.round(b * 100) / 100),
        fc.array(
          fc.double({ min: 0.01, max: 999999.99, noNaN: true }).map((a) => Math.round(a * 100) / 100),
          { minLength: 2, maxLength: 8 }
        ),
        async (initialBalance, amounts) => {
          // Only test when total requested exceeds balance
          const totalRequested = amounts.reduce((sum, a) => sum + a, 0);
          fc.pre(totalRequested > initialBalance * 1.5); // ensure significant overdraft attempt

          const { client } = createMockSupabaseClient(initialBalance);

          const results = await Promise.all(
            amounts.map((amount) =>
              executeWithdrawal(
                {
                  userId: 'test-user',
                  amount,
                  method: 'card',
                  requisites: '12345678',
                },
                client as never
              )
            )
          );

          // At least one withdrawal must be rejected
          const failedCount = results.filter((r) => !r.success).length;
          expect(failedCount).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
