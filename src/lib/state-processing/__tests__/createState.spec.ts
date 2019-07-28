import { resubject } from '@lib/resubject';
import { from } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { createState } from '../createState';

describe('createState', () => {
  describe('.subscribable', () => {
    it('state is a working subscribable', done => {
      const state = createState(true);

      state.subscribe(value => {
        expect(value).toBe(true);
        done();
      });
    });

    it('contains working subscribable on state.subscribable', done => {
      const state = createState(true);

      state.subscribable.subscribe(value => {
        expect(value).toBe(true);
        done();
      });
    });
  });

  describe('interop observable', () => {
    it('contains working subscribable on state[Symbol.observable]', done => {
      const state = createState(true);

      from(state).subscribe(value => {
        expect(value).toBe(true);
        done();
      });
    });

    it('contains working subscribable on state.observable[Symbol.observable]', done => {
      const state = createState(true);

      from(state.observable).subscribe(value => {
        expect(value).toBe(true);
        done();
      });
    });
  });

  describe('.feed', () => {
    it('applies state processing logic and emits expected states', () => {
      const state = createState(0);
      const values = resubject<number>();

      state.feed(values, (value, state) => value.pipe(withLatestFrom(state, (value, state) => state + value)));

      const spy = jest.fn();

      from(state).subscribe(spy);

      values(1);
      values(10);
      values(100);

      const timesEmitted = spy.mock.calls.length;
      const lastEmittedResult = spy.mock.calls.pop()[0];

      expect(timesEmitted).toBe(4);
      expect(lastEmittedResult).toBe(111);
    });
  });

  describe('.get', () => {
    it('statically returns initial state', () => {
      const state = createState(0);
      expect(state.get()).toEqual(0);
    });

    it('statically returns current (modified) state', () => {
      const state = createState(0);
      const values = resubject<number>();

      state.feed(values, (value, state) => value.pipe(withLatestFrom(state, (value, state) => state + value)));

      from(state).subscribe();

      values(1);
      values(10);
      values(100);

      const currentState = state.get();

      expect(currentState).toBe(111);
    });
  });
});
