import { createValidation, ValidationError, Validator } from '@lib/validation'; // will be a library import
import { Observable, of } from 'rxjs';
import {
  catchError,
  defaultIfEmpty,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  pluck,
  skip,
  startWith,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { FieldState } from '../types';

type Params<T> = {
  validators: Validator<T>[];
};

type State<T> = FieldState<T>;

export function validation<T>(params: Observable<Params<T>>, state: Observable<State<T>>): Observable<State<T>> {
  const valueChanged = state.pipe(
    skip(1),
    pluck('value'),
    distinctUntilChanged(),
  );

  // We want to abort pending validation process if value has been changed
  // Tip: merge with another sources to abort validation based on more than just one condition!
  const validationAborted = valueChanged;

  return params.pipe(
    startWith({} as Params<T>),
    pairwise(), // keep tracking previous and new params together
    withLatestFrom(state, ([prevParams, currParams], currState) => ({
      prevParams,
      currParams,
      currState,
    })),
    filter(function shouldValidate({ prevParams, currParams, currState }) {
      return (
        /*
        ABORT and RESTART validation process when .validate() method is called again with new validators list  
        */
        prevParams.validators !== currParams.validators ||
        /*
        don't do anything if validation is in progress
        */
        !currState.isValidating
      );
    }),
    switchMap(({ currParams, currState }) => {
      const { validators } = currParams;
      const { value } = currState;
      const validate = createValidation(validators);
      const validation = validate(value);

      return validation.pipe(
        takeUntil(validationAborted),
        map(stateUpdates.resolved),
        catchError(stateUpdates.rejected),
        defaultIfEmpty(stateUpdates.aborted),
        startWith(stateUpdates.pending),
      );
    }),
    withLatestFrom(state, (patch, state) => ({ ...state, ...patch })),
  );
}

const emptyErrorsList = [] as ValidationError[];

const stateUpdates = {
  pending: {
    isValidating: true,
    validationErrors: emptyErrorsList,
    isValid: false,
  },
  aborted: {
    isValidating: false,
    validationErrors: emptyErrorsList,
    isValid: false,
  },
  rejected: (e: any) =>
    of({
      isValidating: false,
      validationErrors: [String(e)],
      isValid: false,
    }),
  resolved: (validationErrors: ValidationError[]) => ({
    isValidating: false,
    validationErrors,
    isValid: validationErrors.length === 0,
  }),
};
