export interface SafeError {
  userMessage: string;      // Для UI (без технических деталей)
  logPayload: {             // Для консоли/логов
    operation: string;
    userId: string;
    timestamp: string;
    originalError: unknown;
  };
}

/**
 * Маппинг типов операций на понятные русскоязычные сообщения для пользователя.
 * Не содержит технических деталей — только описание типа действия.
 */
const OPERATION_MESSAGES: Record<string, string> = {
  withdrawal: 'Не удалось выполнить вывод средств',
  balance_update: 'Не удалось обновить баланс',
  report: 'Не удалось отправить отчёт',
  cancel: 'Не удалось отменить заявку',
  order: 'Не удалось обработать заказ',
};

const DEFAULT_MESSAGE = 'Произошла ошибка. Попробуйте позже';

/**
 * Обрабатывает ошибку Supabase, возвращая безопасное сообщение для UI
 * и полный лог-пейлоад для отладки.
 *
 * userMessage никогда не содержит stack traces, SQL, error codes или internal URLs.
 * logPayload содержит operation, userId, ISO timestamp и оригинальную ошибку.
 */
export function handleSupabaseError(
  error: unknown,
  context: { operation: string; userId: string }
): SafeError {
  const userMessage = OPERATION_MESSAGES[context.operation] ?? DEFAULT_MESSAGE;

  return {
    userMessage,
    logPayload: {
      operation: context.operation,
      userId: context.userId,
      timestamp: new Date().toISOString(),
      originalError: error,
    },
  };
}
