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
      const validator = formlyConfigService.getValidator('minLength');
      const control = new FormControl('');
      expect(validator?.(control, { minLength: 5 })).toBeNull();
    });

    it('should return null when value meets minimum length', () => {
      const validator = formlyConfigService.getValidator('minLength');
      const control = new FormControl('12345');
      expect(validator?.(control, { minLength: 5 })).toBeNull();
    });

    it('should return null when value exceeds minimum length', () => {
      const validator = formlyConfigService.getValidator('minLength');
      const control = new FormControl('123456');
      expect(validator?.(control, { minLength: 5 })).toBeNull();
    });

    it('should return error when value is below minimum length', () => {
      const validator = formlyConfigService.getValidator('minLength');
      const control = new FormControl('1234');
      expect(validator?.(control, { minLength: 5 })).toEqual({
        minLength: { requiredLength: 5, actualLength: 4 }
      });
    });
  });

  describe('maxLengthValidator', () => {
    it('should return null for empty value', () => {
      const validator = formlyConfigService.getValidator('maxLength');
      const control = new FormControl('');
      expect(validator?.(control, { maxLength: 10 })).toBeNull();
    });

    it('should return null when value is within maximum length', () => {
      const validator = formlyConfigService.getValidator('maxLength');
      const control = new FormControl('12345');
      expect(validator?.(control, { maxLength: 10 })).toBeNull();
    });

    it('should return null when value equals maximum length', () => {
      const validator = formlyConfigService.getValidator('maxLength');
      const control = new FormControl('1234567890');
      expect(validator?.(control, { maxLength: 10 })).toBeNull();
    });

    it('should return error when value exceeds maximum length', () => {
      const validator = formlyConfigService.getValidator('maxLength');
      const control = new FormControl('12345678901');
      expect(validator?.(control, { maxLength: 10 })).toEqual({
        maxLength: { requiredLength: 10, actualLength: 11 }
      });
    });
  });

  describe('minValidator', () => {
    it('should return null for empty value', () => {
      const validator = formlyConfigService.getValidator('min');
      const control = new FormControl('');
      expect(validator?.(control, { min: 18 })).toBeNull();
    });

    it('should return null for value of 0 when min is 0', () => {
      const validator = formlyConfigService.getValidator('min');
      const control = new FormControl(0);
      expect(validator?.(control, { min: 0 })).toBeNull();
    });

    it('should return null when value meets minimum', () => {
      const validator = formlyConfigService.getValidator('min');
      const control = new FormControl(18);
      expect(validator?.(control, { min: 18 })).toBeNull();
    });

    it('should return null when value exceeds minimum', () => {
      const validator = formlyConfigService.getValidator('min');
      const control = new FormControl(25);
      expect(validator?.(control, { min: 18 })).toBeNull();
    });

    it('should return error when value is below minimum', () => {
      const validator = formlyConfigService.getValidator('min');
      const control = new FormControl(15);
      expect(validator?.(control, { min: 18 })).toEqual({
        min: { min: 18, actual: 15 }
      });
    });
  });

  describe('maxValidator', () => {
    it('should return null for empty value', () => {
      const validator = formlyConfigService.getValidator('max');
      const control = new FormControl('');
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return null for value of 0 when max is greater', () => {
      const validator = formlyConfigService.getValidator('max');
      const control = new FormControl(0);
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return null when value is below maximum', () => {
      const validator = formlyConfigService.getValidator('max');
      const control = new FormControl(100);
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return null when value equals maximum', () => {
      const validator = formlyConfigService.getValidator('max');
      const control = new FormControl(120);
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return error when value exceeds maximum', () => {
      const validator = formlyConfigService.getValidator('max');
      const control = new FormControl(150);
      expect(validator?.(control, { max: 120 })).toEqual({
        max: { max: 120, actual: 150 }
      });
    });
  });

  describe('patternValidator', () => {
    it('should return null for empty value', () => {
      const validator = formlyConfigService.getValidator('pattern');
      const control = new FormControl('');
      expect(validator?.(control, { pattern: /^[A-Z]+$/ })).toBeNull();
    });

    it('should return null when value matches pattern (RegExp)', () => {
      const validator = formlyConfigService.getValidator('pattern');
      const control = new FormControl('ABCD');
      expect(validator?.(control, { pattern: /^[A-Z]+$/ })).toBeNull();
    });

    it('should return null when value matches pattern (string)', () => {
      const validator = formlyConfigService.getValidator('pattern');
      const control = new FormControl('ABCD');
      expect(validator?.(control, { pattern: '^[A-Z]+$' })).toBeNull();
    });

    it('should return error when value does not match pattern', () => {
      const validator = formlyConfigService.getValidator('pattern');
      const control = new FormControl('abc123');
      const result = validator?.(control, { pattern: /^[A-Z]+$/ });
      expect(result).toBeTruthy();
      expect(result?.['pattern']).toBeDefined();
    });
  });
});
