import { FormControl, ValidationErrors } from '@angular/forms';
import { FormlyConfig } from '@ngx-formly/core';
import { FormlyConfigService } from '../../src/app/services/formly-config.service';

describe('FormlyConfigService', () => {
  let formlyConfigService: FormlyConfigService;
  let mockFormlyConfig: jest.Mocked<Partial<FormlyConfig>>;

  beforeEach(() => {
    mockFormlyConfig = {
      addValidatorMessage: jest.fn()
    };
    formlyConfigService = new FormlyConfigService(mockFormlyConfig as FormlyConfig);
  });

  describe('registerValidationMessages', () => {
    it('should register validation messages', () => {
      const messages: Record<string, string> = {
        required: 'This field is required',
        email: 'Invalid email address'
      };

      formlyConfigService.registerValidationMessages(messages);

      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledTimes(2);
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('required', 'This field is required');
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('email', 'Invalid email address');
    });
  });

  describe('registerDefaultValidationMessages', () => {
    it('should register default validation messages in French', () => {
      formlyConfigService.registerDefaultValidationMessages();

      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledTimes(6);
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('required', 'Ce champ est requis');
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('minLength', 'Longueur minimale non atteinte');
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('maxLength', 'Longueur maximale dépassée');
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('min', 'La valeur est trop petite');
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('max', 'La valeur est trop grande');
      expect(mockFormlyConfig.addValidatorMessage).toHaveBeenCalledWith('pattern', 'Format invalide');
    });
  });

  describe('normalizeRegexPattern', () => {
    it('should escape trailing hyphens in character classes', () => {
      const pattern = "[a-z'-]";
      const normalized = formlyConfigService.normalizeRegexPattern(pattern);
      expect(normalized).toBe("[a-z'\\-]");
    });

    it('should not affect valid ranges', () => {
      const pattern = "[a-z]";
      const normalized = formlyConfigService.normalizeRegexPattern(pattern);
      expect(normalized).toBe("[a-z]");
    });

    it('should handle multiple trailing hyphens', () => {
      const pattern = "[a-z'-][0-9-]";
      const normalized = formlyConfigService.normalizeRegexPattern(pattern);
      expect(normalized).toBe("[a-z'\\-][0-9\\-]");
    });

    it('should return original pattern on error', () => {
      const pattern = "valid-pattern";
      const normalized = formlyConfigService.normalizeRegexPattern(pattern);
      expect(normalized).toBe("valid-pattern");
    });
  });
});
