import { InteropObservable, observable as symbolObservable, OperatorFunction as OF, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

type Callable<T> = keyof T extends never ? () => void : (value: T) => void;
type CallableObservable<T, R> = Callable<T> & InteropObservable<R>;
type CO<T, R> = CallableObservable<T, R>;

export function resubject<T>(): CO<T, T>;
export function resubject<T, A>(fn1: OF<T, A>): CO<T, A>;
export function resubject<T, A, B>(fn1: OF<T, A>, fn2: OF<A, B>): CO<T, B>;
export function resubject<T, A, B, C>(fn1: OF<T, A>, fn2: OF<A, B>, fn3: OF<B, C>): CO<T, C>;
export function resubject<T, A, B, C, D>(fn1: OF<T, A>, fn2: OF<A, B>, fn3: OF<B, C>, fn4: OF<C, D>): CO<T, D>;
export function resubject<T, A, B, C, D, E>(
  fn1: OF<T, A>,
  fn2: OF<A, B>,
  fn3: OF<B, C>,
  fn4: OF<C, D>,
  fn5: OF<D, E>,
): CO<T, E>;
export function resubject<T, A, B, C, D, E, F>(
  fn1: OF<T, A>,
  fn2: OF<A, B>,
  fn3: OF<B, C>,
  fn4: OF<C, D>,
  fn5: OF<D, E>,
  fn6: OF<E, F>,
): CO<T, F>;
export function resubject<T, A, B, C, D, E, F, G>(
  fn1: OF<T, A>,
  fn2: OF<A, B>,
  fn3: OF<B, C>,
  fn4: OF<C, D>,
  fn5: OF<D, E>,
  fn6: OF<E, F>,
  fn7: OF<F, G>,
): CO<T, G>;
export function resubject<T, A, B, C, D, E, F, G, H>(
  fn1: OF<T, A>,
  fn2: OF<A, B>,
  fn3: OF<B, C>,
  fn4: OF<C, D>,
  fn5: OF<D, E>,
  fn6: OF<E, F>,
  fn7: OF<F, G>,
  fn8: OF<G, H>,
): CO<T, H>;
export function resubject<T, A, B, C, D, E, F, G, H, I>(
  fn1: OF<T, A>,
  fn2: OF<A, B>,
  fn3: OF<B, C>,
  fn4: OF<C, D>,
  fn5: OF<D, E>,
  fn6: OF<E, F>,
  fn7: OF<F, G>,
  fn8: OF<G, H>,
  fn9: OF<H, I>,
): CO<T, I>;
export function resubject<T, A, B, C, D, E, F, G, H, I>(
  fn1: OF<T, A>,
  fn2: OF<A, B>,
  fn3: OF<B, C>,
  fn4: OF<C, D>,
  fn5: OF<D, E>,
  fn6: OF<E, F>,
  fn7: OF<F, G>,
  fn8: OF<G, H>,
  fn9: OF<H, I>,
  ...pipeline: OF<any, any>[]
): CO<T, {}>;

export function resubject(...pipeline: OF<any, any>[]): CO<any, any> {
  const subject: any = new Subject();
  const subscribable: any = subject.pipe(
    ...pipeline,
    share(),
  );
  const resubject: any = (value: any) => subject.next(value);

  resubject[symbolObservable] = () => subscribable;

  return resubject;
}
