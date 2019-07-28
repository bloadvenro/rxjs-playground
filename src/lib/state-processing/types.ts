import { InteropObservable, Observable, Subscribable } from 'rxjs';

export type StateProcessing<I, S> = (params: Observable<I>, state: Observable<S>) => Observable<S>;

export interface IReactiveState<S> extends Subscribable<S>, InteropObservable<S> {
  /**
   * Why `observable` property?
   *
   * When creating state inside a store factory we also want our store to be observable, which means we want to receive
   * state emissions when subscribing to a store. To achieve this we allow direct subscriptions to a state from store's
   * instance, thus we expose state's observable API as is. Example:
   *
   * ```
   * const counterStoreAPI = {
   *   ...counterState.observable
   *   ...
   * }
   *
   * return counterStoreAPI
   * ```
   *
   * Without `observable` property of `counterState` there is no handy way to expose observability. We cannot just
   * "spread" `counterState` inside `counterStoreAPI` or pluck `[Symbol.observable]` property from `counterState` to
   * assign it to `counterStoreAPI` as we work with `Symbol.observable` polyfill static type systems.
   */
  observable: InteropObservable<S>;
  /**
   * Similar to the case with `observable`:
   *
   * ```
   * const counterStoreAPI = {
   *   ...counterState.subscribable
   *   ...
   * }
   *
   * return counterStoreAPI
   * ```
   *
   * `subscribable` property destructuring is better than direct assignment of `state.subscribe` method to a store API
   * as this may discourage (should I `.bind` this method first?).
   */
  subscribable: Subscribable<S>;
  /**
   * Statically get current state.
   */
  get(): S;
  /**
   * Feed state processing data and logic to state instance.
   *
   * @param input - data signal to form next state
   * @param stateProcessing - logic to form next state
   */
  feed<I>(input: Observable<I> | InteropObservable<I>, stateProcessing: StateProcessing<I, S>): void;
}
