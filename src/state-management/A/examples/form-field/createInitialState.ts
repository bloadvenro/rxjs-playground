import { FieldState } from './types';

export function createInitialState<T>(initialValue: T): FieldState<T> {
  return {
    value: initialValue,
    validationErrors: [],
    isPristine: true,
    isValidating: false,
    isValid: false,
  };
}
