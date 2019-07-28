import { resubject } from '@lib/resubject';
import { BehaviorSubject, from } from 'rxjs';
import { skip, take, withLatestFrom } from 'rxjs/operators';
import { createInitialState } from '../../createInitialState';
import { validation } from '../validation';

describe('field validation state processing', () => {
  describe('pending/resolved/rejected/aborted state emissions', () => {
    it('emits pending state', done => {
      const initialState = createInitialState('');
      const state = new BehaviorSubject(initialState);
      const validators = new BehaviorSubject([]);

      const validate = resubject(
        withLatestFrom(validators, (_, validators) => ({
          validators,
        })),
      );

      validation(from(validate), state)
        .pipe(take(1))
        .subscribe(state => {
          expect(state.isValidating).toBe(true);
          expect(state.validationErrors).toEqual([]);
          expect(state.isValid).toBe(false);
          done();
        });

      validate();
    });

    it('resolves with no validation errors', done => {
      const initialState = createInitialState('x');

      const state = new BehaviorSubject(initialState);

      const validators = new BehaviorSubject([
        (value: string) => (value.length === 0 ? 'required' : undefined), //
      ]);

      const validate = resubject(
        withLatestFrom(validators, (_, validators) => ({
          validators,
        })),
      );

      const subscription = validation(from(validate), state)
        .pipe(skip(1))
        .subscribe({
          next(state) {
            expect(state.isValidating).toBe(false);
            expect(state.validationErrors).toEqual([]);
            expect(state.isValid).toBe(true);
            done();
          },
        });

      validate();

      subscription.unsubscribe();
    });

    it('resolves with some validation errors', done => {
      const initialState = createInitialState('');

      const state = new BehaviorSubject(initialState);

      const validators = new BehaviorSubject([
        (value: string) => (value.length === 0 ? 'required' : undefined), //
      ]);

      const validate = resubject(
        withLatestFrom(validators, (_, validators) => ({
          validators,
        })),
      );

      validation(from(validate), state)
        .pipe(skip(1))
        .subscribe({
          next(state) {
            expect(state.isValidating).toBe(false);
            expect(state.validationErrors).toEqual(['required']);
            expect(state.isValid).toBe(false);
            done();
          },
        });

      validate();
    });

    it('rejects with an error', done => {
      const error = new Error('Network 500');
      const initialState = createInitialState('this value will pass');

      const state = new BehaviorSubject(initialState);

      const validators = new BehaviorSubject([
        async () => {
          throw error;
        },
      ]);

      const validate = resubject(
        withLatestFrom(validators, (_, validators) => ({
          validators,
        })),
      );

      validation(from(validate), state)
        .pipe(skip(1))
        .subscribe({
          next(state) {
            expect(state.isValidating).toBe(false);
            expect(state.validationErrors).toEqual([String(error)]);
            expect(state.isValid).toBe(false);
            done();
          },
        });

      validate();
    });

    it.todo("doesn't abort validaton when .validate() method is called again during validation processing");

    it('aborts validation on state.value change', done => {
      const initialState = createInitialState('');

      const state = new BehaviorSubject(initialState);

      const validators = new BehaviorSubject([async () => "won't be thrown"]);

      const validate = resubject(
        withLatestFrom(validators, (_, validators) => ({
          validators,
        })),
      );

      validation(from(validate), state)
        .pipe(skip(1))
        .subscribe({
          next(state) {
            expect(state.isValidating).toBe(false);
            expect(state.validationErrors).toEqual([]);
            expect(state.isValid).toBe(false);
            done();
          },
        });

      validate();

      state.next({ ...state.getValue(), value: 'next value' });
    });

    it.todo('aborts validation when .validate() method is called again with another set of validators');
  });
});
