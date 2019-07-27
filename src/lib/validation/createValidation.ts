import { EMPTY, from, Observable, of } from 'rxjs';
import { concatMap, first, mergeMap, take } from 'rxjs/operators';
import { ValidationError, Validator } from './types';

const emptyErrorList = [] as ValidationError[];

export function createValidation<T>(validators: Validator<T>[]) {
  return function validate(value: T): Observable<ValidationError[]> {
    return from(validators).pipe(
      concatMap(validator => {
        const validatorResult = validator(value);

        if (is.nullable(validatorResult)) return EMPTY;
        if (is.string(validatorResult)) return of([validatorResult]);
        if (is.list(validatorResult)) return of(validatorResult);

        return from(validatorResult).pipe(
          take(1),
          mergeMap(resolvedValidatorResult => {
            if (is.nullable(resolvedValidatorResult)) return EMPTY;
            if (is.list(resolvedValidatorResult)) return of(resolvedValidatorResult);
            return of([resolvedValidatorResult]);
          }),
        );
      }),
      first(is.not.nullable, emptyErrorList),
    );
  };
}

const is = {
  nullable: (x: any): x is null | undefined => x === null || x === undefined,
  string: (x: any): x is string => typeof x === 'string',
  list: (x: any): x is any[] => Array.isArray(x),
  not: {
    nullable: <T>(x: T): x is NonNullable<T> => x !== null && x !== undefined,
  },
};
