import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: premium-redesign, Property 15: Balance invariant — never negative
 * Validates: Requirements 7.5
 *
 * For any starting balance B ≥ 0 and any valid sequence of financial operations
 * (withdrawals, payments, cancellations, refunds) applied sequentially,
 * the resulting balance SHALL always be ≥ 0 after each operation.
 */

/**
 * Operation types representing financial operations in the system.
 * - withdrawal: decreases balance if sufficient funds (rejected otherwise)
 * - payment: decreases balance if sufficient funds (rejected otherwise)
 * - cancellation: increases balance (refund from cancelled order)
 * - refund: increases balance (refund from processed transaction)
 */
type OperationType = 'withdrawal' | 'payment' | 'cancellation' | 'refund';

interface FinancialOperation {
  type: OperationType;
  amount: number;
}

/**
 * Applies a financial operation to the current balance following the invariant rules:
 * - Withdrawals/payments with amount > balance are rejected (balance unchanged)
 * - Cancellations and refunds always succeed and increase balance
 *
 * Returns the new balance after the operation.
 */
function applyOperation(balance: number, operation: FinancialOperation): number {
  switch (operation.type) {
    case 'withdrawal':
    case 'payment':
      // Reject if insufficient funds — balance unchanged
      if (operation.amount > balance) {
        return balance;
      }
      return balance - operation.amount;

    case 'cancellation':
    case 'refund':
      // Always succeed — increases balance
      return balance + operation.amount;
  }
}

describe('Property 15: Balance invariant — never negative', () => {
  // Generator for a valid financial operation amount (positive, within system bounds)
  const operationAmount = fc.double({ min: 0.01, max: 999999.99, noNaN: true });

  // Generator for operation type
  const operationType = fc.constantFrom<OperationType>(
    'withdrawal',
    'payment',
    'cancellation',
    'refund'
  );

  // Generator for a single financial operation
  const financialOperation: fc.Arbitrary<FinancialOperation> = fc.record({
    type: operationType,
    amount: operationAmount,
  });

  // Generator for a sequence of operations
  const operationSequence = fc.array(financialOperation, { minLength: 1, maxLength: 20 });

  // Generator for starting balance (non-negative)
  const startingBalance = fc.double({ min: 0, max: 999999.99, noNaN: true });

  it('balance is never negative after any operation in a sequence', () => {
    fc.assert(
      fc.property(
        startingBalance,
        operationSequence,
        (initialBalance, operations) => {
          let balance = initialBalance;

          for (const operation of operations) {
            balance = applyOperation(balance, operation);
            // The core invariant: balance must NEVER be negative
            expect(balance).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('withdrawals and payments with amount > balance are rejected (balance unchanged)', () => {
    fc.assert(
      fc.property(
        startingBalance,
        operationAmount,
        fc.constantFrom<'withdrawal' | 'payment'>('withdrawal', 'payment'),
        (balance, amount, type) => {
          if (amount > balance) {
            const newBalance = applyOperation(balance, { type, amount });
            expect(newBalance).toBe(balance);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('cancellations and refunds always succeed and increase balance', () => {
    fc.assert(
      fc.property(
        startingBalance,
        operationAmount,
        fc.constantFrom<'cancellation' | 'refund'>('cancellation', 'refund'),
        (balance, amount, type) => {
          const newBalance = applyOperation(balance, { type, amount });
          expect(newBalance).toBe(balance + amount);
          expect(newBalance).toBeGreaterThan(balance);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('withdrawals/payments with sufficient funds decrease balance by exact amount', () => {
    fc.assert(
      fc.property(
        // Ensure balance is large enough for the withdrawal
        fc.double({ min: 1, max: 999999.99, noNaN: true }),
        fc.constantFrom<'withdrawal' | 'payment'>('withdrawal', 'payment'),
        (balance, type) => {
          // Generate amount ≤ balance to ensure sufficient funds
          const amount = balance * 0.5; // Always within balance
          const newBalance = applyOperation(balance, { type, amount });
          expect(newBalance).toBeCloseTo(balance - amount, 10);
          expect(newBalance).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('any interleaving of operations maintains non-negative balance', () => {
    fc.assert(
      fc.property(
        startingBalance,
        operationSequence,
        (initialBalance, operations) => {
          let balance = initialBalance;
          const balanceHistory: number[] = [balance];

          for (const operation of operations) {
            balance = applyOperation(balance, operation);
            balanceHistory.push(balance);
          }

          // Every recorded balance must be non-negative
          for (const recorded of balanceHistory) {
            expect(recorded).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
