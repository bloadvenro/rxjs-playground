import { BehaviorSubject, from, Observable, observable as symbolObservable, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { IReactiveState } from './types';

export function createState<S>(initialState: S): IReactiveState<S> {
  const state = new BehaviorSubject(initialState);
  const rootSubscription = new Subscription();
  const stateProcessingInitializers = [] as (() => Observable<S>)[];

  const stateProvider = new Observable<S>(observer => {
    rootSubscription.add(
      state.subscribe({
        next: observer.next.bind(observer),
        error: observer.error.bind(observer),
        complete: observer.complete.bind(observer),
      }),
    );

    for (const initializer of stateProcessingInitializers) {
      rootSubscription.add(
        initializer().subscribe({
          next: state.next.bind(state),
          error: state.error.bind(state),
          complete: state.complete.bind(state),
        }),
      );
    }

    return rootSubscription;
    //
  }).pipe(shareReplay(replayOptions));

  const observable = { [symbolObservable]: () => stateProvider } as any;
  const subscribable = { subscribe: stateProvider.subscribe.bind(stateProvider) };

  return {
    ...observable,
    ...subscribable,
    observable,
    subscribable,
    get() {
      return state.getValue();
    },
    feed(input, stateProcessing) {
      stateProcessingInitializers.push(() => stateProcessing(from(input), state));
    },
  };
}

const replayOptions = { bufferSize: 1, refCount: true };
