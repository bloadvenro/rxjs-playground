import { createValidation, ValidationError, Validator } from '@lib/validation'; // will be a library import
import { Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  endWith,
  filter,
  map,
  pairwise,
  pluck,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { FieldState } from '../types';

type Params<T> = Observable<{
  validators: Validator<T>[];
}>;

type State<T> = Observable<FieldState<T>>;

export function validation<T>(params: Params<T>, state: State<T>): State<T> {
  const valueChanged = state.pipe(
    pluck('value'),
    distinctUntilChanged(),
  );

  // We want to abort pending validation process if value has been changed
  const validationAborted = valueChanged;

  return params.pipe(
    pairwise(), // keep tracking previous params
    withLatestFrom(state, ([prevParams, currParams], currState) => ({
      prevParams,
      currParams,
      currState,
    })),
    filter(function shouldValidate({ prevParams, currParams, currState }) {
      // We want to:
      // 1. NOT start new validation while field is currently validating (e.g. .validate() method was called twice)
      // 2. ABORT and RESTART validation process if validators were replaced AND then .validate() method was called
      return !currState.isValidating || prevParams.validators !== currParams.validators;
    }),
    switchMap(({ currParams, currState }) => {
      // ^^^ will abort current validation and start brand new one if shouldValidate condition is passed
      const { validators } = currParams;
      const { value } = currState;
      const validate = createValidation(validators);
      const validation = validate(value);

      return validation.pipe(
        map((validationErrors: ValidationError[]) => ({
          isValidating: false,
          validationErrors,
          isValid: validationErrors.length === 0,
        })),
        catchError(e =>
          of({
            isValidating: false,
            validationErrors: [String(e)],
            isValid: false,
          }),
        ),
        startWith({
          isValidating: true,
          validationErrors: [],
          isValid: false,
        }),
        endWith({
          isValidating: false,
          validationErrors: [],
          isValid: false,
        }),
        takeUntil(validationAborted), // < will kill validation process
      );
    }),
    withLatestFrom(state, (result, state) => ({ ...state, result })),
  );
}
