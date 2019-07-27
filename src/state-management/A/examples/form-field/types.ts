import { ValidationError } from '@lib/validation';
import { InteropObservable, Subscribable } from 'rxjs';

export type FieldState<T> = {
  value: T;
  validationErrors: ValidationError[];
  isPristine: boolean;
  isValidating: boolean;
  isValid: boolean;
};

export interface IFieldStore<T> extends Subscribable<FieldState<T>>, InteropObservable<FieldState<T>> {
  change(value: T): void;
  validate(): void;
}
