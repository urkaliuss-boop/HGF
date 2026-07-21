import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { executeWithdrawal } from '../../utils/transactions';

/**
 * Feature: premium-redesign, Property 11: Withdrawal operation is atomic with rollback
 * Validates: Requirements 7.1, 7.7
 *
 * For any withdrawal request with (userId, amount, method, requisites) where amount > 0,
 * the executeWithdrawal function SHALL either:
 * (a) succeed — resulting in a new withdrawal record AND balance decreased by amount, or
 * (b) fail — resulting in NO withdrawal record AND balance unchanged.
 * There SHALL be no intermediate state where a record exists but balance is not updated, or vice versa.
 */

/**
 * Creates a mock Supabase client that tracks state (balance, withdrawals array).
 * Allows injecting failures at specific points to test atomicity.
 */
function createMockSupabaseClient(options: {
  initialBalance: number;
  hasSession: boolean;
  failOnBalanceUpdate?: boolean;
}) {
  const state = {
    balance: options.initialBalance,
    withdrawals: [] as Array<{
      id: string;
      user_id: string;
      amount: number;
      method: string;
      requisites: string;
      status: string;
      created_at: string;
    }>,
  };

  let withdrawalIdCounter = 0;

  const client = {
    auth: {
      getSession: async () => ({
        data: { session: options.hasSession ? { user: { id: 'test' } } : null },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: (_columns?: string) => ({
            eq: (_column: string, _value: unknown) => ({
              single: async () => ({
                data: { balance: state.balance },
                error: null,
              }),
            }),
          }),
          insert: (_record: unknown) => ({
            select: (_columns?: string) => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
          update: (_values: unknown) => ({
            eq: async (_column: string, _value: unknown) => {
              if (options.failOnBalanceUpdate) {
                return { data: null, error: { message: 'Update failed', code: '500' } };
              }
              // Apply balance update
              const updateValues = _values as { balance: number };
              state.balance = updateValues.balance;
              return { data: null, error: null };
            },
          }),
          delete: () => ({
            eq: async (_column: string, value: unknown) => {
              // Rollback: remove the withdrawal record
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
          insert: (record: unknown) => ({
            select: (_columns?: string) => ({
              single: async () => {
                const rec = record as {
                  user_id: string;
                  amount: number;
                  method: string;
                  requisites: string;
                  status: string;
                };
                const withdrawal = {
                  id: `wd_${++withdrawalIdCounter}`,
                  ...rec,
                  created_at: new Date().toISOString(),
                };
                state.withdrawals.push(withdrawal);
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

      // Fallback for unknown tables
      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: async () => ({ data: null, error: null }) }),
        delete: () => ({ eq: async () => ({ data: null, error: null }) }),
      };
    },
  };

  return { client, state };
}

describe('Property 11: Withdrawal operation is atomic with rollback', () => {
  const validMethod = fc.constantFrom('sbp', 'card', 'lolz', 'yoomoney');
  const validRequisites = fc.string({ minLength: 5, maxLength: 50 });
  const validUserId = fc.uuid();

  it('successful withdrawal: record exists AND balance decreased by amount', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserId,
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 1001, max: 50000, noNaN: true }),
        validMethod,
        validRequisites,
        async (userId, amount, initialBalance, method, requisites) => {
          // Ensure balance > amount so the withdrawal can succeed
          const { client, state } = createMockSupabaseClient({
            initialBalance,
            hasSession: true,
            failOnBalanceUpdate: false,
          });

          const balanceBefore = state.balance;
          const withdrawalCountBefore = state.withdrawals.length;

          const result = await executeWithdrawal(
            { userId, amount, method, requisites },
            client as never
          );

          if (result.success) {
            // (a) Success: withdrawal record exists AND balance decreased by amount
            expect(state.withdrawals.length).toBe(withdrawalCountBefore + 1);
            expect(state.balance).toBeCloseTo(balanceBefore - amount, 5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('when balance update fails: NO withdrawal record AND balance unchanged (rollback)', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserId,
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 1001, max: 50000, noNaN: true }),
        validMethod,
        validRequisites,
        async (userId, amount, initialBalance, method, requisites) => {
          const { client, state } = createMockSupabaseClient({
            initialBalance,
            hasSession: true,
            failOnBalanceUpdate: true, // Simulate balance update failure
          });

          const balanceBefore = state.balance;
          const withdrawalCountBefore = state.withdrawals.length;

          const result = await executeWithdrawal(
            { userId, amount, method, requisites },
            client as never
          );

          // (b) Fail: NO withdrawal record AND balance unchanged
          expect(result.success).toBe(false);
          expect(state.withdrawals.length).toBe(withdrawalCountBefore);
          expect(state.balance).toBe(balanceBefore);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no intermediate state: withdrawal record never exists without balance update', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserId,
        fc.double({ min: 0.01, max: 1000, noNaN: true }),
        fc.double({ min: 1001, max: 50000, noNaN: true }),
        validMethod,
        validRequisites,
        fc.boolean(),
        async (userId, amount, initialBalance, method, requisites, shouldFail) => {
          const { client, state } = createMockSupabaseClient({
            initialBalance,
            hasSession: true,
            failOnBalanceUpdate: shouldFail,
          });

          const balanceBefore = state.balance;

          const result = await executeWithdrawal(
            { userId, amount, method, requisites },
            client as never
          );

          // Atomicity invariant: after the operation completes,
          // the system must be in one of two consistent states:
          const hasWithdrawalRecord = state.withdrawals.length > 0;
          const balanceDecreased = state.balance < balanceBefore;

          if (result.success) {
            // State (a): both record and balance update exist
            expect(hasWithdrawalRecord).toBe(true);
            expect(balanceDecreased).toBe(true);
          } else {
            // State (b): neither record nor balance change
            expect(hasWithdrawalRecord).toBe(false);
            expect(balanceDecreased).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('insufficient funds: no record AND balance unchanged', async () => {
    await fc.assert(
      fc.asyncProperty(
        validUserId,
        fc.double({ min: 100, max: 5000, noNaN: true }),
        fc.double({ min: 0.01, max: 99, noNaN: true }),
        validMethod,
        validRequisites,
        async (userId, amount, initialBalance, method, requisites) => {
          // initialBalance < amount → insufficient funds
          const { client, state } = createMockSupabaseClient({
            initialBalance,
            hasSession: true,
            failOnBalanceUpdate: false,
          });

          const balanceBefore = state.balance;

          const result = await executeWithdrawal(
            { userId, amount, method, requisites },
            client as never
          );

          // Must fail with no side effects
          expect(result.success).toBe(false);
          expect(state.withdrawals.length).toBe(0);
          expect(state.balance).toBe(balanceBefore);
        }
      ),
      { numRuns: 100 }
    );
  });
});
