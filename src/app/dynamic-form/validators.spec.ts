import { FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import {
  emailValidator,
  emailValidatorMessage,
  nameValidator,
  nameValidatorMessage,
  licenseNumberValidator,
  licenseNumberValidatorMessage,
  requiredValidatorMessage,
  minLengthValidatorMessage,
  maxLengthValidatorMessage,
  minValidatorMessage,
  maxValidatorMessage,
  patternValidatorMessage,
  minLengthValidatorFactory,
  maxLengthValidatorFactory,
  minValidatorFactory,
  maxValidatorFactory,
  patternValidatorFactory
} from './validators';

describe('Validators', () => {
  describe('emailValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(emailValidator(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(emailValidator(control)).toBeNull();
    });

    it('should return null for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const control = new FormControl(email);
        expect(emailValidator(control)).toBeNull();
      });
    });

    it('should return error for invalid email addresses', () => {
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
        expect(emailValidator(control)).toEqual({ email: true });
      });
    });
  });

  describe('emailValidatorMessage', () => {
    it('should return correct error message', () => {
      const field: FormlyFieldConfig = {};
      const message = emailValidatorMessage({}, field);
      expect(message).toBe('Please enter a valid email address');
    });
  });

  describe('nameValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(nameValidator(control)).toBeNull();
    });

    it('should return null for valid names', () => {
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
        expect(nameValidator(control)).toBeNull();
      });
    });

    it('should return error for invalid names', () => {
      const invalidNames = [
        'John123',
        'Mary@Jane',
        'Test!',
        'Name#1',
        'User_Name'
      ];

      invalidNames.forEach(name => {
        const control = new FormControl(name);
        expect(nameValidator(control)).toEqual({ name: true });
      });
    });
  });

  describe('nameValidatorMessage', () => {
    it('should return message with field label', () => {
      const field: FormlyFieldConfig = {
        props: { label: 'First Name' }
      };
      const message = nameValidatorMessage({}, field);
      expect(message).toBe('First Name can only contain letters, spaces, hyphens and apostrophes');
    });

    it('should return default message when no label', () => {
      const field: FormlyFieldConfig = {};
      const message = nameValidatorMessage({}, field);
      expect(message).toBe('This field can only contain letters, spaces, hyphens and apostrophes');
    });
  });

  describe('licenseNumberValidator', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(licenseNumberValidator(control)).toBeNull();
    });

    it('should return null for valid license numbers', () => {
      const validLicenses = [
        'ABC123',
        'ABCDEF',
        '123456',
        'A1B2C3D4E5F6',
        'AAAA11'
      ];

      validLicenses.forEach(license => {
        const control = new FormControl(license);
        expect(licenseNumberValidator(control)).toBeNull();
      });
    });

    it('should return error for invalid license numbers', () => {
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
        expect(licenseNumberValidator(control)).toEqual({ licenseNumber: true });
      });
    });
  });

  describe('licenseNumberValidatorMessage', () => {
    it('should return correct error message', () => {
      const field: FormlyFieldConfig = {};
      const message = licenseNumberValidatorMessage({}, field);
      expect(message).toBe('License number must be 6-12 uppercase letters or numbers');
    });
  });

  describe('requiredValidatorMessage', () => {
    it('should return message with field label', () => {
      const field: FormlyFieldConfig = {
        props: { label: 'Email' }
      };
      const message = requiredValidatorMessage({}, field);
      expect(message).toBe('Email is required');
    });

    it('should return default message when no label', () => {
      const field: FormlyFieldConfig = {};
      const message = requiredValidatorMessage({}, field);
      expect(message).toBe('This field is required');
    });
  });

  describe('minLengthValidatorFactory', () => {
    it('should return null for empty value', () => {
      const validator = minLengthValidatorFactory(5);
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return null when value meets minimum length', () => {
      const validator = minLengthValidatorFactory(5);
      const control = new FormControl('12345');
      expect(validator(control)).toBeNull();
    });

    it('should return null when value exceeds minimum length', () => {
      const validator = minLengthValidatorFactory(5);
      const control = new FormControl('123456');
      expect(validator(control)).toBeNull();
    });

    it('should return error when value is below minimum length', () => {
      const validator = minLengthValidatorFactory(5);
      const control = new FormControl('1234');
      expect(validator(control)).toEqual({
        minLength: { requiredLength: 5, actualLength: 4 }
      });
    });
  });

  describe('minLengthValidatorMessage', () => {
    it('should return message with required length', () => {
      const field: FormlyFieldConfig = {};
      const error = { requiredLength: 5, actualLength: 3 };
      const message = minLengthValidatorMessage(error, field);
      expect(message).toBe('Minimum 5 characters required');
    });
  });

  describe('maxLengthValidatorFactory', () => {
    it('should return null for empty value', () => {
      const validator = maxLengthValidatorFactory(10);
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return null when value is within maximum length', () => {
      const validator = maxLengthValidatorFactory(10);
      const control = new FormControl('12345');
      expect(validator(control)).toBeNull();
    });

    it('should return null when value equals maximum length', () => {
      const validator = maxLengthValidatorFactory(10);
      const control = new FormControl('1234567890');
      expect(validator(control)).toBeNull();
    });

    it('should return error when value exceeds maximum length', () => {
      const validator = maxLengthValidatorFactory(10);
      const control = new FormControl('12345678901');
      expect(validator(control)).toEqual({
        maxLength: { requiredLength: 10, actualLength: 11 }
      });
    });
  });

  describe('maxLengthValidatorMessage', () => {
    it('should return message with maximum length', () => {
      const field: FormlyFieldConfig = {};
      const error = { requiredLength: 10, actualLength: 15 };
      const message = maxLengthValidatorMessage(error, field);
      expect(message).toBe('Maximum 10 characters allowed');
    });
  });

  describe('minValidatorFactory', () => {
    it('should return null for empty value', () => {
      const validator = minValidatorFactory(18);
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return null for value of 0 when min is 0', () => {
      const validator = minValidatorFactory(0);
      const control = new FormControl(0);
      expect(validator(control)).toBeNull();
    });

    it('should return null when value meets minimum', () => {
      const validator = minValidatorFactory(18);
      const control = new FormControl(18);
      expect(validator(control)).toBeNull();
    });

    it('should return null when value exceeds minimum', () => {
      const validator = minValidatorFactory(18);
      const control = new FormControl(25);
      expect(validator(control)).toBeNull();
    });

    it('should return error when value is below minimum', () => {
      const validator = minValidatorFactory(18);
      const control = new FormControl(15);
      expect(validator(control)).toEqual({
        min: { min: 18, actual: 15 }
      });
    });
  });



  describe('minValidatorMessage', () => {
    it('should return message with minimum value', () => {
      const field: FormlyFieldConfig = {};
      const error = { min: 18, actual: 15 };
      const message = minValidatorMessage(error, field);
      expect(message).toBe('Value must be at least 18');
    });
  });

  describe('maxValidatorFactory', () => {
    it('should return null for empty value', () => {
      const validator = maxValidatorFactory(120);
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return null for value of 0 when max is greater', () => {
      const validator = maxValidatorFactory(120);
      const control = new FormControl(0);
      expect(validator(control)).toBeNull();
    });

    it('should return null when value is below maximum', () => {
      const validator = maxValidatorFactory(120);
      const control = new FormControl(100);
      expect(validator(control)).toBeNull();
    });

    it('should return null when value equals maximum', () => {
      const validator = maxValidatorFactory(120);
      const control = new FormControl(120);
      expect(validator(control)).toBeNull();
    });

    it('should return error when value exceeds maximum', () => {
      const validator = maxValidatorFactory(120);
      const control = new FormControl(150);
      expect(validator(control)).toEqual({
        max: { max: 120, actual: 150 }
      });
    });
  });

  describe('maxValidatorMessage', () => {
    it('should return message with maximum value', () => {
      const field: FormlyFieldConfig = {};
      const error = { max: 120, actual: 150 };
      const message = maxValidatorMessage(error, field);
      expect(message).toBe('Value cannot exceed 120');
    });
  });

  describe('patternValidatorFactory', () => {
    it('should return null for empty value', () => {
      const validator = patternValidatorFactory(/^[A-Z]+$/);
      const control = new FormControl('');
      expect(validator(control)).toBeNull();
    });

    it('should return null when value matches pattern (RegExp)', () => {
      const validator = patternValidatorFactory(/^[A-Z]+$/);
      const control = new FormControl('ABCD');
      expect(validator(control)).toBeNull();
    });

    it('should return null when value matches pattern (string)', () => {
      const validator = patternValidatorFactory('^[A-Z]+$');
      const control = new FormControl('ABCD');
      expect(validator(control)).toBeNull();
    });

    it('should return error when value does not match pattern', () => {
      const validator = patternValidatorFactory(/^[A-Z]+$/);
      const control = new FormControl('abc123');
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result?.['pattern']).toBeDefined();
    });
  });

  describe('patternValidatorMessage', () => {
    it('should return custom pattern message if provided', () => {
      const field: FormlyFieldConfig = {
        props: { patternMessage: 'Custom pattern error' }
      };
      const message = patternValidatorMessage({}, field);
      expect(message).toBe('Custom pattern error');
    });

    it('should return default message when no custom message', () => {
      const field: FormlyFieldConfig = {};
      const message = patternValidatorMessage({}, field);
      expect(message).toBe('Invalid format');
    });
  });
});
