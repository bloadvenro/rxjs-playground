import { createValidation } from '../createValidation';
import { ValidationError } from '../types';

describe('validation', () => {
  it('emits empty list of errors when given empty validators list', done => {
    const value = '';
    const validators = [] as any;
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe(errors => {
      expect(errors).toEqual([]);
      done();
    });
  });

  it('required', done => {
    const value = 'not empty';
    const validators = [required];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([]);
      },
      complete() {
        done();
      },
    });
  });

  it('!required', done => {
    const value = '';
    const validators = [required];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([ERR_REQUIRED]);
      },
      complete() {
        done();
      },
    });
  });

  it('required max10', done => {
    const value = 'x'.repeat(10);
    const validators = [required, max10];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([]);
      },
      complete() {
        done();
      },
    });
  });

  it('required !max10', done => {
    const value = 'x'.repeat(11);
    const validators = [required, max10];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([ERR_MAX10]);
      },
      complete() {
        done();
      },
    });
  });

  it('required max10 unique', done => {
    const value = 'x'.repeat(10);
    const validators = [required, max10, unique];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([]);
      },
      complete() {
        done();
      },
    });
  });

  it('required max10 !unique', done => {
    const value = VAL_TO_FAIL_UNIQUE;
    const validators = [required, max10, unique];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([ERR_UNIQUE]);
      },
      complete() {
        done();
      },
    });
  });

  it('required !max10 [stop] unique', done => {
    const value = 'x'.repeat(11);
    const validators = [required, max10, unique];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([ERR_MAX10]);
      },
      complete() {
        done();
      },
    });
  });

  it('complex', done => {
    const value = 'x'.repeat(10);
    const validators = [complex];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([]);
      },
      complete() {
        done();
      },
    });
  });

  it('complex:!max', done => {
    const value = 'x'.repeat(11);
    const validators = [complex];
    const validate = createValidation(validators);
    const process = validate(value);

    process.subscribe({
      next(errors) {
        expect(errors).toEqual([ERR_MAX10]);
      },
      complete() {
        done();
      },
    });
  });
});

const ERR_REQUIRED = 'required';
const ERR_MIN4 = 'min 4';
const ERR_MAX10 = 'max 10';
const ERR_UNIQUE = 'is taken';

const VAL_TO_FAIL_UNIQUE = ERR_UNIQUE;

const required = (value: string) => (value.length === 0 ? ERR_REQUIRED : undefined);

const min4 = (value: string) => (value.length < 4 ? ERR_MIN4 : undefined);
const max10 = (value: string) => (value.length > 10 ? ERR_MAX10 : undefined);

const unique = async (value: string) => {
  await new Promise(resolve => setTimeout(resolve, 1));
  return value === 'is taken' ? ERR_UNIQUE : undefined;
};

const complex = async (value: string) => {
  const requiredError = required(value);

  if (requiredError) return [requiredError];

  const syncErrors = [min4(value), max10(value)].filter(Boolean) as ValidationError[];

  if (syncErrors.length > 0) return syncErrors;

  const asyncErrors = [await unique(value)].filter(Boolean) as ValidationError[];

  if (asyncErrors.length > 0) return asyncErrors;

  return [];
};
