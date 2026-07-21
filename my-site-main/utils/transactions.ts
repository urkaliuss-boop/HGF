import { supabase } from '../supabaseClient';
import { validateWithdrawalInput, type WithdrawalInput } from './validation';
import { handleSupabaseError } from './errorHandler';

/**
 * Результат транзакционной операции.
 * success: true + data — при успехе
 * success: false + error — при ошибке
 */
export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: { type: string; message: string };
}

/**
 * Запись о выводе средств.
 */
export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  requisites: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

/**
 * Параметры для операции вывода средств.
 */
interface WithdrawalParams {
  userId: string;
  amount: number;
  method: string;
  requisites: string;
}

/**
 * Минимальный интерфейс Supabase-клиента для DI (тестируемость).
 */
interface SupabaseClient {
  auth: {
    getSession: () => Promise<{ data: { session: unknown | null }; error: unknown | null }>;
  };
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: unknown) => {
        single: () => Promise<{ data: unknown; error: unknown | null }>;
      };
    };
    insert: (record: unknown) => {
      select: (columns?: string) => {
        single: () => Promise<{ data: unknown; error: unknown | null }>;
      };
    };
    update: (values: unknown) => {
      eq: (column: string, value: unknown) => Promise<{ data: unknown; error: unknown | null }>;
    };
    delete: () => {
      eq: (column: string, value: unknown) => Promise<{ data: unknown; error: unknown | null }>;
    };
  };
}

/**
 * Выполняет операцию вывода средств с гарантиями:
 * - Проверка сессии (авторизация)
 * - Валидация ввода
 * - Проверка баланса
 * - Race condition prevention (повторная проверка баланса)
 * - Rollback при ошибке обновления баланса
 * - Баланс никогда не уходит в минус
 *
 * @param params — параметры вывода (userId, amount, method, requisites)
 * @param client — опциональный Supabase-клиент для DI (тестирование)
 */
export async function executeWithdrawal(
  params: WithdrawalParams,
  client?: SupabaseClient
): Promise<TransactionResult<Withdrawal>> {
  const db = (client ?? supabase) as SupabaseClient;
  const { userId, amount, method, requisites } = params;

  // 1. Проверка активной сессии
  try {
    const { data: sessionData, error: sessionError } = await db.auth.getSession();
    if (sessionError || !sessionData.session) {
      return {
        success: false,
        error: { type: 'auth', message: 'Требуется авторизация' },
      };
    }
  } catch {
    return {
      success: false,
      error: { type: 'auth', message: 'Требуется авторизация' },
    };
  }

  // 2. Валидация ввода
  const validationInput: WithdrawalInput = {
    amount,
    method: method as WithdrawalInput['method'],
    requisites,
  };
  const validation = validateWithdrawalInput(validationInput);
  if (!validation.valid) {
    const firstError = Object.values(validation.errors)[0] ?? 'Невалидные данные';
    return {
      success: false,
      error: { type: 'validation', message: firstError },
    };
  }

  // 3. Первичная проверка баланса
  const { data: profileData, error: profileError } = await db
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single() as { data: { balance: number } | null; error: unknown | null };

  if (profileError || !profileData) {
    const safeError = handleSupabaseError(profileError, { operation: 'withdrawal', userId });
    return {
      success: false,
      error: { type: 'balance_check', message: safeError.userMessage },
    };
  }

  if (profileData.balance < amount) {
    return {
      success: false,
      error: { type: 'insufficient_funds', message: 'Недостаточно средств' },
    };
  }

  // 4. Race condition prevention: повторная проверка баланса непосредственно перед списанием
  const { data: recheckData, error: recheckError } = await db
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single() as { data: { balance: number } | null; error: unknown | null };

  if (recheckError || !recheckData) {
    const safeError = handleSupabaseError(recheckError, { operation: 'withdrawal', userId });
    return {
      success: false,
      error: { type: 'balance_check', message: safeError.userMessage },
    };
  }

  if (recheckData.balance < amount) {
    return {
      success: false,
      error: { type: 'insufficient_funds', message: 'Недостаточно средств' },
    };
  }

  // 5. Insert withdrawal record (status: 'pending')
  const { data: withdrawalData, error: insertError } = await db
    .from('withdrawals')
    .insert({
      user_id: userId,
      amount,
      method,
      requisites,
      status: 'pending',
    })
    .select('*')
    .single() as { data: Withdrawal | null; error: unknown | null };

  if (insertError || !withdrawalData) {
    const safeError = handleSupabaseError(insertError, { operation: 'withdrawal', userId });
    return {
      success: false,
      error: { type: 'insert_failed', message: safeError.userMessage },
    };
  }

  // 6. Update balance: decrement
  const newBalance = recheckData.balance - amount;

  // Гарантия: баланс никогда не уходит в минус
  if (newBalance < 0) {
    // Rollback: удаляем запись вывода
    await db.from('withdrawals').delete().eq('id', withdrawalData.id);
    return {
      success: false,
      error: { type: 'insufficient_funds', message: 'Недостаточно средств' },
    };
  }

  const { error: updateError } = await db
    .from('profiles')
    .update({ balance: newBalance })
    .eq('id', userId);

  // 7. Rollback on failure: если обновление баланса провалилось — удаляем withdrawal
  if (updateError) {
    await db.from('withdrawals').delete().eq('id', withdrawalData.id);
    const safeError = handleSupabaseError(updateError, { operation: 'balance_update', userId });
    return {
      success: false,
      error: { type: 'update_failed', message: safeError.userMessage },
    };
  }

  // Успех
  return {
    success: true,
    data: withdrawalData,
  };
}
