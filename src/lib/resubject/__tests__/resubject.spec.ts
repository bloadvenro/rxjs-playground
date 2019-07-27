import { from, zip } from 'rxjs';
import { map, mapTo, tap } from 'rxjs/operators';
import { resubject } from '..';

describe('resubject', () => {
  it('creates handler w/o any transformations accepting empty value', done => {
    const next = resubject();
    from(next).subscribe(done);
    next();
  });

  it('creates handler with a single transformation accepting empty value', done => {
    const next = resubject(mapTo(true));
    from(next).subscribe(value => {
      expect(value).toEqual(true);
      done();
    });
    next();
  });

  it('creates handler with two transformations accepting empty value', done => {
    const double = (value: number) => value * 2;
    const next = resubject(mapTo(2), map(double));
    from(next).subscribe(value => {
      expect(value).toEqual(4);
      done();
    });
    next();
  });

  it('creates handler w/o any transformations accepting certain value type', done => {
    const next = resubject<number>();
    from(next).subscribe(value => {
      expect(value).toEqual(2);
      done();
    });
    next(2);
  });

  it('creates handler with a single transformation accepting certain value type', done => {
    const double = (value: number) => value * 2;
    const next = resubject(map(double));
    from(next).subscribe(value => {
      expect(value).toEqual(4);
      done();
    });
    next(2);
  });

  it('creates handler with two transformations accepting certain value type', done => {
    const double = (value: number) => value * 2;
    const toString = (value: { toString(): string }) => value.toString();
    const next = resubject(map(double), map(toString));
    from(next).subscribe(value => {
      expect(value).toEqual('4');
      done();
    });
    next(2);
  });

  it('tests shared behavior', done => {
    const callback = jest.fn();
    const next = resubject<unknown, unknown>(tap(callback));
    const source = zip(from(next), from(next));
    source.subscribe(() => {
      expect(callback.mock.calls.length).toEqual(1);
      done();
    });
    next();
  });
});
