import { FormControl } from '@angular/forms';
import { FormlyFieldConfig, FormlyConfig } from '@ngx-formly/core';
import { FormlyConfigService } from '../../src/app/services/formly-config.service';

describe('Validators', () => {
  let formlyConfigService: FormlyConfigService;
  let mockFormlyConfig: Partial<FormlyConfig>;

  beforeEach(() => {
    mockFormlyConfig = {
      addValidator: jest.fn(),
      addValidationMessage: jest.fn()
    };
    formlyConfigService = new FormlyConfigService(mockFormlyConfig as FormlyConfig);
  });



  describe('minLengthValidator', () => {
    it('should return null for empty value', () => {
      const factory = formlyConfigService.getValidatorFactory('minLength');
      const validator = factory?.({ minLength: 5 });
      const control = new FormControl('');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value meets minimum length', () => {
      const factory = formlyConfigService.getValidatorFactory('minLength');
      const validator = factory?.({ minLength: 5 });
      const control = new FormControl('12345');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value exceeds minimum length', () => {
      const factory = formlyConfigService.getValidatorFactory('minLength');
      const validator = factory?.({ minLength: 5 });
      const control = new FormControl('123456');
      expect(validator?.(control)).toBeNull();
    });

    it('should return error when value is below minimum length', () => {
      const factory = formlyConfigService.getValidatorFactory('minLength');
      const validator = factory?.({ minLength: 5 });
      const control = new FormControl('1234');
      expect(validator?.(control)).toEqual({
        minLength: { requiredLength: 5, actualLength: 4 }
      });
    });
  });

  describe('maxLengthValidator', () => {
    it('should return null for empty value', () => {
      const factory = formlyConfigService.getValidatorFactory('maxLength');
      const validator = factory?.({ maxLength: 10 });
      const control = new FormControl('');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value is within maximum length', () => {
      const factory = formlyConfigService.getValidatorFactory('maxLength');
      const validator = factory?.({ maxLength: 10 });
      const control = new FormControl('12345');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value equals maximum length', () => {
      const factory = formlyConfigService.getValidatorFactory('maxLength');
      const validator = factory?.({ maxLength: 10 });
      const control = new FormControl('1234567890');
      expect(validator?.(control)).toBeNull();
    });

    it('should return error when value exceeds maximum length', () => {
      const factory = formlyConfigService.getValidatorFactory('maxLength');
      const validator = factory?.({ maxLength: 10 });
      const control = new FormControl('12345678901');
      expect(validator?.(control)).toEqual({
        maxLength: { requiredLength: 10, actualLength: 11 }
      });
    });
  });

  describe('minValidator', () => {
    it('should return null for empty value', () => {
      const factory = formlyConfigService.getValidatorFactory('min');
      const validator = factory?.({ min: 18 });
      const control = new FormControl('');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null for value of 0 when min is 0', () => {
      const factory = formlyConfigService.getValidatorFactory('min');
      const validator = factory?.({ min: 0 });
      const control = new FormControl(0);
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value meets minimum', () => {
      const factory = formlyConfigService.getValidatorFactory('min');
      const validator = factory?.({ min: 18 });
      const control = new FormControl(18);
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value exceeds minimum', () => {
      const factory = formlyConfigService.getValidatorFactory('min');
      const validator = factory?.({ min: 18 });
      const control = new FormControl(25);
      expect(validator?.(control)).toBeNull();
    });

    it('should return error when value is below minimum', () => {
      const factory = formlyConfigService.getValidatorFactory('min');
      const validator = factory?.({ min: 18 });
      const control = new FormControl(15);
      expect(validator?.(control)).toEqual({
        min: { min: 18, actual: 15 }
      });
    });
  });

  describe('maxValidator', () => {
    it('should return null for empty value', () => {
      const factory = formlyConfigService.getValidatorFactory('max');
      const validator = factory?.({ max: 120 });
      const control = new FormControl('');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null for value of 0 when max is greater', () => {
      const factory = formlyConfigService.getValidatorFactory('max');
      const validator = factory?.({ max: 120 });
      const control = new FormControl(0);
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value is below maximum', () => {
      const factory = formlyConfigService.getValidatorFactory('max');
      const validator = factory?.({ max: 120 });
      const control = new FormControl(100);
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value equals maximum', () => {
      const factory = formlyConfigService.getValidatorFactory('max');
      const validator = factory?.({ max: 120 });
      const control = new FormControl(120);
      expect(validator?.(control)).toBeNull();
    });

    it('should return error when value exceeds maximum', () => {
      const factory = formlyConfigService.getValidatorFactory('max');
      const validator = factory?.({ max: 120 });
      const control = new FormControl(150);
      expect(validator?.(control)).toEqual({
        max: { max: 120, actual: 150 }
      });
    });
  });

  describe('patternValidator', () => {
    it('should return null for empty value', () => {
      const factory = formlyConfigService.getValidatorFactory('pattern');
      const validator = factory?.({ pattern: /^[A-Z]+$/ });
      const control = new FormControl('');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value matches pattern (RegExp)', () => {
      const factory = formlyConfigService.getValidatorFactory('pattern');
      const validator = factory?.({ pattern: /^[A-Z]+$/ });
      const control = new FormControl('ABCD');
      expect(validator?.(control)).toBeNull();
    });

    it('should return null when value matches pattern (string)', () => {
      const factory = formlyConfigService.getValidatorFactory('pattern');
      const validator = factory?.({ pattern: '^[A-Z]+$' });
      const control = new FormControl('ABCD');
      expect(validator?.(control)).toBeNull();
    });

    it('should return error when value does not match pattern', () => {
      const factory = formlyConfigService.getValidatorFactory('pattern');
      const validator = factory?.({ pattern: /^[A-Z]+$/ });
      const control = new FormControl('abc123');
      const result = validator?.(control);
      expect(result).toBeTruthy();
      expect(result?.['pattern']).toBeDefined();
    });
  });
});
