import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

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
 * Service to manage dynamic validator registration
 * Allows validators to be defined on the server and registered at runtime
 */
@Injectable({
  providedIn: 'root'
})
export class ValidatorRegistryService {
  private validators: Map<string, ValidatorFn> = new Map();
  private validationMessages: Map<string, (error: any, field: FormlyFieldConfig) => string> = new Map();

  constructor() {
    this.registerBuiltInValidators();
  }

  /**
   * Register built-in validators that can be used by the server
   */
  private registerBuiltInValidators(): void {
    // Email validator
    this.registerValidator('email', (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(control.value) ? null : { email: true };
    });

    // Name validator (letters, spaces, hyphens, apostrophes only)
    this.registerValidator('name', (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;
      return nameRegex.test(control.value) ? null : { name: true };
    });

    // License number validator (6-12 uppercase letters or numbers)
    this.registerValidator('licenseNumber', (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const licenseRegex = /^[A-Z0-9]{6,12}$/;
      return licenseRegex.test(control.value) ? null : { licenseNumber: true };
    });

    // Pattern validator factory
    this.registerValidator('pattern', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value || !config?.pattern) {
        return null;
      }
      try {
        const regex = new RegExp(config.pattern);
        return regex.test(control.value.toString())
          ? null
          : { pattern: { requiredPattern: config.pattern, actualValue: control.value } };
      } catch (error) {
        console.error('Invalid regex pattern:', config.pattern, error);
        return null;
      }
    });

    // Min length validator
    this.registerValidator('minLength', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value || !config?.minLength) {
        return null;
      }
      const value = control.value.toString();
      return value.length >= config.minLength
        ? null
        : { minLength: { requiredLength: config.minLength, actualLength: value.length } };
    });

    // Max length validator
    this.registerValidator('maxLength', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value || !config?.maxLength) {
        return null;
      }
      const value = control.value.toString();
      return value.length <= config.maxLength
        ? null
        : { maxLength: { requiredLength: config.maxLength, actualLength: value.length } };
    });

    // Min value validator
    this.registerValidator('min', (control: AbstractControl, config?: any): ValidationErrors | null => {
      if (!control.value && control.value !== 0 || !config?.min) {
        return null;
      }
      const numValue = Number(control.value);
      return !isNaN(numValue) && numValue >= config.min
        ? null
        : { min: { min: config.min, actual: numValue } };
    });

    // Max value validator
    this.registerValidator('max', (control: AbstractControl, config?: any): ValidationErrors | null => {
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
   */
  registerValidator(name: string, validator: ValidatorFn): void {
    this.validators.set(name, validator);
  }

  /**
   * Get a registered validator
   */
  getValidator(name: string): ValidatorFn | undefined {
    return this.validators.get(name);
  }

  /**
   * Register a validation message
   */
  registerValidationMessage(
    name: string,
    messageFn: (error: any, field: FormlyFieldConfig) => string
  ): void {
    this.validationMessages.set(name, messageFn);
  }

  /**
   * Get a registered validation message function
   */
  getValidationMessage(name: string): ((error: any, field: FormlyFieldConfig) => string) | undefined {
    return this.validationMessages.get(name);
  }

  /**
   * Register default validation messages
   */
  registerDefaultValidationMessages(): void {
    this.registerValidationMessage('required', (error: any, field: FormlyFieldConfig) => {
      return `${field.props?.label || 'This field'} is required`;
    });

    this.registerValidationMessage('email', () => {
      return 'Please enter a valid email address';
    });

    this.registerValidationMessage('name', (error: any, field: FormlyFieldConfig) => {
      return `${field.props?.label || 'This field'} can only contain letters, spaces, hyphens and apostrophes`;
    });

    this.registerValidationMessage('licenseNumber', () => {
      return 'License number must be 6-12 uppercase letters or numbers';
    });

    this.registerValidationMessage('minLength', (error: any) => {
      return `Minimum ${error.requiredLength} characters required`;
    });

    this.registerValidationMessage('maxLength', (error: any) => {
      return `Maximum ${error.requiredLength} characters allowed`;
    });

    this.registerValidationMessage('min', (error: any) => {
      return `Value must be at least ${error.min}`;
    });

    this.registerValidationMessage('max', (error: any) => {
      return `Value cannot exceed ${error.max}`;
    });

    this.registerValidationMessage('pattern', (error: any, field: FormlyFieldConfig) => {
      return field.props?.['patternMessage'] || 'Invalid format';
    });
  }
}

