export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface WithdrawalInput {
  amount: number;
  method: 'sbp' | 'card' | 'lolz' | 'yoomoney';
  requisites: string;
  bankName?: string;
}

/**
 * Validates email using a simplified RFC 5322 pattern.
 * Checks for standard email format: local@domain.tld
 */
export function validateEmail(email: string): boolean {
  // Simplified RFC 5322 pattern:
  // - Local part: alphanumeric + special chars (._%+-)
  // - @ separator
  // - Domain: alphanumeric + hyphens, with dot-separated labels
  // - TLD: at least 2 characters
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates that amount is within the allowed range: 0.01–999999.99
 */
export function validateAmount(amount: number): boolean {
  if (typeof amount !== 'number' || !isFinite(amount)) {
    return false;
  }
  return amount >= 0.01 && amount <= 999999.99;
}

/**
 * Validates that text length does not exceed the maximum (default 1000 characters).
 */
export function validateTextLength(text: string, max: number = 1000): boolean {
  return text.length <= max;
}

/**
 * Validates that requisites have at least 5 characters.
 */
export function validateRequisites(value: string): boolean {
  return value.length >= 5;
}

/**
 * Comprehensive validation for withdrawal input.
 * Validates all fields and returns structured errors.
 */
export function validateWithdrawalInput(input: WithdrawalInput): ValidationResult {
  const errors: Record<string, string> = {};

  // Validate amount
  if (!validateAmount(input.amount)) {
    errors.amount = 'Сумма должна быть от 0.01 до 999999.99';
  }

  // Validate method
  const validMethods: WithdrawalInput['method'][] = ['sbp', 'card', 'lolz', 'yoomoney'];
  if (!validMethods.includes(input.method)) {
    errors.method = 'Недопустимый метод вывода';
  }

  // Validate requisites
  if (!validateRequisites(input.requisites)) {
    errors.requisites = 'Реквизиты должны содержать не менее 5 символов';
  }

  // Validate bankName is required for sbp method
  if (input.method === 'sbp') {
    if (!input.bankName || input.bankName.trim().length === 0) {
      errors.bankName = 'Название банка обязательно для СБП';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
