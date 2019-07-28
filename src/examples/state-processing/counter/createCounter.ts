import { resubject } from '@lib/resubject';
import { createState } from '@lib/state-processing';
import { merge } from 'rxjs';
import { mapTo, withLatestFrom } from 'rxjs/operators';

export function createCounter(startWith = 0) {
  const counter = createState(startWith);

  const increment = resubject(mapTo(1));
  const decrement = resubject(mapTo(-1));
  const add = resubject<number>();

  const values = merge(increment, decrement, add);

  counter.feed(values, (values, state) =>
    values.pipe(
      withLatestFrom(state, (value, state) => state + value), //
    ),
  );

  const { observable, subscribable } = counter;

  return {
    increment,
    decrement,
    add,
    ...observable,
    ...subscribable,
  };
}
