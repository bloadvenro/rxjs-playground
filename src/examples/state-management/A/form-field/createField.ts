import { resubject } from '@lib/resubject';
import { Validator } from '@lib/validation'; // will be a library import
import { createState } from '@state-management/A'; // will be a library import
import { BehaviorSubject, identity } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { createInitialState } from './createInitialState';
import { validation } from './processing/validation';
import { IFieldStore } from './types';

type Params<T> = {
  validators?: Validator<T>[];
  normalize?: (value: T) => T;
};

export function createField<T>(initialValue: T, params: Params<T>): IFieldStore<T> {
  const { normalize = identity } = params;
  const initialState = createInitialState(initialValue);
  const validators = new BehaviorSubject(params.validators || []);

  const field = createState(initialState);

  const change = resubject(map(normalize));
  const validate = resubject(
    withLatestFrom(validators, (_, validators) => ({
      validators,
    })),
  );

  field.feed(validate, validation);
  // TODO: field.feed(change, userInput)

  const { observable, subscribable } = field;

  return {
    change,
    validate,
    ...observable,
    ...subscribable,
  };
}
