import { createCounter } from '../createCounter';

describe('createCounter', () => {
  it('emits expected state sequence', () => {
    const counter = createCounter(20);
    const spy = jest.fn();

    counter.subscribe(spy);

    counter.increment();
    counter.increment();
    counter.increment();
    counter.decrement();
    counter.add(100);

    expect(spy.mock.calls.length).toBe(6);
    expect(spy.mock.calls.pop().pop()).toBe(122);
  });
});
