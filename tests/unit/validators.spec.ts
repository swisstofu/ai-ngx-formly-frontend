import { FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ValidatorRegistryService } from '../../src/app/services/validator-registry.service';

describe('Validators', () => {
  let validatorRegistry: ValidatorRegistryService;

  beforeEach(() => {
    validatorRegistry = new ValidatorRegistryService();
  });

  describe('emailValidator', () => {
    it('should return null for empty value', () => {
      const emailValidator = validatorRegistry.getValidator('email');
      const control = new FormControl('');
      expect(emailValidator?.(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const emailValidator = validatorRegistry.getValidator('email');
      const control = new FormControl(null);
      expect(emailValidator?.(control)).toBeNull();
    });

    it('should return null for valid email addresses', () => {
      const emailValidator = validatorRegistry.getValidator('email');
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const control = new FormControl(email);
        expect(emailValidator?.(control)).toBeNull();
      });
    });

    it('should return error for invalid email addresses', () => {
      const emailValidator = validatorRegistry.getValidator('email');
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid @example.com',
        'invalid@example .com'
      ];

      invalidEmails.forEach(email => {
        const control = new FormControl(email);
        expect(emailValidator?.(control)).toEqual({ email: true });
      });
    });
  });

  describe('nameValidator', () => {
    it('should return null for empty value', () => {
      const nameValidator = validatorRegistry.getValidator('name');
      const control = new FormControl('');
      expect(nameValidator?.(control)).toBeNull();
    });

    it('should return null for valid names', () => {
      const nameValidator = validatorRegistry.getValidator('name');
      const validNames = [
        'John',
        'Mary-Jane',
        "O'Brien",
        'Jean-Pierre',
        'José García',
        'François',
        'Müller',
        'Anne Marie'
      ];

      validNames.forEach(name => {
        const control = new FormControl(name);
        expect(nameValidator?.(control)).toBeNull();
      });
    });

    it('should return error for invalid names', () => {
      const nameValidator = validatorRegistry.getValidator('name');
      const invalidNames = [
        'John123',
        'Mary@Jane',
        'Test!',
        'Name#1',
        'User_Name'
      ];

      invalidNames.forEach(name => {
        const control = new FormControl(name);
        expect(nameValidator?.(control)).toEqual({ name: true });
      });
    });
  });

  describe('licenseNumberValidator', () => {
    it('should return null for empty value', () => {
      const licenseNumberValidator = validatorRegistry.getValidator('licenseNumber');
      const control = new FormControl('');
      expect(licenseNumberValidator?.(control)).toBeNull();
    });

    it('should return null for valid license numbers', () => {
      const licenseNumberValidator = validatorRegistry.getValidator('licenseNumber');
      const validLicenses = [
        'ABC123',
        'ABCDEF',
        '123456',
        'A1B2C3D4E5F6',
        'AAAA11'
      ];

      validLicenses.forEach(license => {
        const control = new FormControl(license);
        expect(licenseNumberValidator?.(control)).toBeNull();
      });
    });

    it('should return error for invalid license numbers', () => {
      const licenseNumberValidator = validatorRegistry.getValidator('licenseNumber');
      const invalidLicenses = [
        'abc123',        // lowercase
        'ABC12',         // too short
        'ABCDEFGHIJKLM', // too long
        'ABC-123',       // contains hyphen
        'ABC 123',       // contains space
        'ABC@123'        // contains special char
      ];

      invalidLicenses.forEach(license => {
        const control = new FormControl(license);
        expect(licenseNumberValidator?.(control)).toEqual({ licenseNumber: true });
      });
    });
  });

  describe('minLengthValidator', () => {
    it('should return null for empty value', () => {
      const validator = validatorRegistry.getValidator('minLength');
      const control = new FormControl('');
      expect(validator?.(control, { minLength: 5 })).toBeNull();
    });

    it('should return null when value meets minimum length', () => {
      const validator = validatorRegistry.getValidator('minLength');
      const control = new FormControl('12345');
      expect(validator?.(control, { minLength: 5 })).toBeNull();
    });

    it('should return null when value exceeds minimum length', () => {
      const validator = validatorRegistry.getValidator('minLength');
      const control = new FormControl('123456');
      expect(validator?.(control, { minLength: 5 })).toBeNull();
    });

    it('should return error when value is below minimum length', () => {
      const validator = validatorRegistry.getValidator('minLength');
      const control = new FormControl('1234');
      expect(validator?.(control, { minLength: 5 })).toEqual({
        minLength: { requiredLength: 5, actualLength: 4 }
      });
    });
  });

  describe('maxLengthValidator', () => {
    it('should return null for empty value', () => {
      const validator = validatorRegistry.getValidator('maxLength');
      const control = new FormControl('');
      expect(validator?.(control, { maxLength: 10 })).toBeNull();
    });

    it('should return null when value is within maximum length', () => {
      const validator = validatorRegistry.getValidator('maxLength');
      const control = new FormControl('12345');
      expect(validator?.(control, { maxLength: 10 })).toBeNull();
    });

    it('should return null when value equals maximum length', () => {
      const validator = validatorRegistry.getValidator('maxLength');
      const control = new FormControl('1234567890');
      expect(validator?.(control, { maxLength: 10 })).toBeNull();
    });

    it('should return error when value exceeds maximum length', () => {
      const validator = validatorRegistry.getValidator('maxLength');
      const control = new FormControl('12345678901');
      expect(validator?.(control, { maxLength: 10 })).toEqual({
        maxLength: { requiredLength: 10, actualLength: 11 }
      });
    });
  });

  describe('minValidator', () => {
    it('should return null for empty value', () => {
      const validator = validatorRegistry.getValidator('min');
      const control = new FormControl('');
      expect(validator?.(control, { min: 18 })).toBeNull();
    });

    it('should return null for value of 0 when min is 0', () => {
      const validator = validatorRegistry.getValidator('min');
      const control = new FormControl(0);
      expect(validator?.(control, { min: 0 })).toBeNull();
    });

    it('should return null when value meets minimum', () => {
      const validator = validatorRegistry.getValidator('min');
      const control = new FormControl(18);
      expect(validator?.(control, { min: 18 })).toBeNull();
    });

    it('should return null when value exceeds minimum', () => {
      const validator = validatorRegistry.getValidator('min');
      const control = new FormControl(25);
      expect(validator?.(control, { min: 18 })).toBeNull();
    });

    it('should return error when value is below minimum', () => {
      const validator = validatorRegistry.getValidator('min');
      const control = new FormControl(15);
      expect(validator?.(control, { min: 18 })).toEqual({
        min: { min: 18, actual: 15 }
      });
    });
  });

  describe('maxValidator', () => {
    it('should return null for empty value', () => {
      const validator = validatorRegistry.getValidator('max');
      const control = new FormControl('');
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return null for value of 0 when max is greater', () => {
      const validator = validatorRegistry.getValidator('max');
      const control = new FormControl(0);
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return null when value is below maximum', () => {
      const validator = validatorRegistry.getValidator('max');
      const control = new FormControl(100);
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return null when value equals maximum', () => {
      const validator = validatorRegistry.getValidator('max');
      const control = new FormControl(120);
      expect(validator?.(control, { max: 120 })).toBeNull();
    });

    it('should return error when value exceeds maximum', () => {
      const validator = validatorRegistry.getValidator('max');
      const control = new FormControl(150);
      expect(validator?.(control, { max: 120 })).toEqual({
        max: { max: 120, actual: 150 }
      });
    });
  });

  describe('patternValidator', () => {
    it('should return null for empty value', () => {
      const validator = validatorRegistry.getValidator('pattern');
      const control = new FormControl('');
      expect(validator?.(control, { pattern: /^[A-Z]+$/ })).toBeNull();
    });

    it('should return null when value matches pattern (RegExp)', () => {
      const validator = validatorRegistry.getValidator('pattern');
      const control = new FormControl('ABCD');
      expect(validator?.(control, { pattern: /^[A-Z]+$/ })).toBeNull();
    });

    it('should return null when value matches pattern (string)', () => {
      const validator = validatorRegistry.getValidator('pattern');
      const control = new FormControl('ABCD');
      expect(validator?.(control, { pattern: '^[A-Z]+$' })).toBeNull();
    });

    it('should return error when value does not match pattern', () => {
      const validator = validatorRegistry.getValidator('pattern');
      const control = new FormControl('abc123');
      const result = validator?.(control, { pattern: /^[A-Z]+$/ });
      expect(result).toBeTruthy();
      expect(result?.['pattern']).toBeDefined();
    });
  });
});
