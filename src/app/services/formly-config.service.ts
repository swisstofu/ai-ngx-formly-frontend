import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormlyConfig, FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Interface for validator definition from server
 */
export interface ValidatorDefinition {
  name: string;
  type: 'builtin' | 'pattern' | 'custom';
  config?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    [key: string]: any;
  };
}

/**
 * Interface for validation message definition from server
 */
export interface ValidationMessageDefinition {
  name: string;
  message: string;
}

/**
 * Service to configure Formly with dynamic validators
 * Manages validator registration and validation messages from server
 */
@Injectable({
  providedIn: 'root'
})
export class FormlyConfigService {
  private validators: Map<string, ValidatorFn> = new Map();

  constructor(private formlyConfig: FormlyConfig) {
    this.registerGenericValidators();
  }

  /**
   * Register generic validators that can be configured by the server
   * These are reusable validators that accept configuration parameters
   */
  private registerGenericValidators(): void {
    // Pattern validator - validates against a regex pattern
    this.validators.set('pattern', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value || !config?.pattern) {
        return null;
      }
      try {
        const regex = typeof config.pattern === 'string' ? new RegExp(config.pattern) : config.pattern;
        return regex.test(control.value.toString())
          ? null
          : { pattern: { requiredPattern: config.pattern.toString(), actualValue: control.value } };
      } catch (e) {
        console.error('Invalid regex pattern:', config.pattern, e);
        return null;
      }
    });

    // Min length validator
    this.validators.set('minLength', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value || !config?.minLength) {
        return null;
      }
      const value = control.value.toString();
      return value.length >= config.minLength
        ? null
        : { minLength: { requiredLength: config.minLength, actualLength: value.length } };
    });

    // Max length validator
    this.validators.set('maxLength', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value || !config?.maxLength) {
        return null;
      }
      const value = control.value.toString();
      return value.length <= config.maxLength
        ? null
        : { maxLength: { requiredLength: config.maxLength, actualLength: value.length } };
    });

    // Min value validator
    this.validators.set('min', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value && control.value !== 0 || !config?.min) {
        return null;
      }
      const numValue = Number(control.value);
      return !isNaN(numValue) && numValue >= config.min
        ? null
        : { min: { min: config.min, actual: numValue } };
    });

    // Max value validator
    this.validators.set('max', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value && control.value !== 0 || !config?.max) {
        return null;
      }
      const numValue = Number(control.value);
      return !isNaN(numValue) && numValue <= config.max
        ? null
        : { max: { max: config.max, actual: numValue } };
    });
  }

  /**
   * Register a custom validator
   * Used by the server to register validators that are not generic
   */
  registerValidator(name: string, validator: ValidatorFn): void {
    this.validators.set(name, validator);
  }

  /**
   * Get a validator by name
   */
  getValidator(name: string): ValidatorFn | undefined {
    return this.validators.get(name);
  }

  /**
   * Register validators with Formly based on server definitions
   */
  registerValidators(validatorDefinitions: ValidatorDefinition[]): void {
    validatorDefinitions.forEach((definition) => {
      const validator = this.getValidator(definition.name);
      if (validator) {
        // Create a validator function that includes the config
        const validatorWithConfig = (control: any) => {
          return validator(control, definition.config);
        };

        this.formlyConfig.setValidator({
          name: definition.name,
          validation: validatorWithConfig
        });
      } else {
        console.warn(`Validator '${definition.name}' not found`);
      }
    });
  }

  /**
   * Register validation messages with Formly based on server definitions
   */
  registerValidationMessages(messageDefinitions: ValidationMessageDefinition[]): void {
    messageDefinitions.forEach((definition) => {
      this.formlyConfig.addValidatorMessage(definition.name, definition.message);
    });
  }

  /**
   * Register default validation messages for generic validators
   */
  registerDefaultValidationMessages(): void {
    const defaultMessages = [
      { name: 'required', message: 'This field is required' },
      { name: 'minLength', message: 'Minimum length not met' },
      { name: 'maxLength', message: 'Maximum length exceeded' },
      { name: 'min', message: 'Value is too small' },
      { name: 'max', message: 'Value is too large' },
      { name: 'pattern', message: 'Invalid format' }
    ];

    this.registerValidationMessages(defaultMessages);
  }
}

