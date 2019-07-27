import { Observable } from 'rxjs';

export type ValidationError = string;

export type ValidatorResult = string | string[] | undefined | null;

// prettier-ignore
export type Validator<T> = (value: T) => 
  | ValidatorResult
  | Promise<ValidatorResult>
  | Observable<ValidatorResult>
