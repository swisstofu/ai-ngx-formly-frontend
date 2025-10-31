import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Email validator
 * Validates that the input is a valid email address
 */
export function emailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Don't validate empty values (use 'required' for that)
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(control.value) ? null : { email: true };
}

/**
 * Email validation message
 */
export function emailValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return 'Please enter a valid email address';
}

/**
 * Min length validator factory
 * Creates a validator that checks minimum string length
 */
export function minLengthValidatorFactory(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    
    const value = control.value.toString();
    return value.length >= minLength 
      ? null 
      : { minLength: { requiredLength: minLength, actualLength: value.length } };
  };
}

/**
 * Min length validation message
 */
export function minLengthValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return `Minimum ${error.requiredLength} characters required`;
}

/**
 * Max length validator factory
 * Creates a validator that checks maximum string length
 */
export function maxLengthValidatorFactory(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    
    const value = control.value.toString();
    return value.length <= maxLength 
      ? null 
      : { maxLength: { requiredLength: maxLength, actualLength: value.length } };
  };
}

/**
 * Max length validation message
 */
export function maxLengthValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return `Maximum ${error.requiredLength} characters allowed`;
}

/**
 * Min value validator factory
 * Creates a validator that checks minimum numeric value
 */
export function minValidatorFactory(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value && control.value !== 0) {
      return null;
    }
    
    const numValue = Number(control.value);
    return !isNaN(numValue) && numValue >= min 
      ? null 
      : { min: { min: min, actual: numValue } };
  };
}

/**
 * Min value validation message
 */
export function minValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return `Value must be at least ${error.min}`;
}

/**
 * Max value validator factory
 * Creates a validator that checks maximum numeric value
 */
export function maxValidatorFactory(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value && control.value !== 0) {
      return null;
    }
    
    const numValue = Number(control.value);
    return !isNaN(numValue) && numValue <= max 
      ? null 
      : { max: { max: max, actual: numValue } };
  };
}

/**
 * Max value validation message
 */
export function maxValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return `Value cannot exceed ${error.max}`;
}

/**
 * Pattern validator factory
 * Creates a validator that checks against a regular expression
 */
export function patternValidatorFactory(pattern: string | RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(control.value.toString()) 
      ? null 
      : { pattern: { requiredPattern: pattern.toString(), actualValue: control.value } };
  };
}

/**
 * Pattern validation message
 */
export function patternValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return field.props?.['patternMessage'] || 'Invalid format';
}

/**
 * Name validator (letters, spaces, hyphens, apostrophes only)
 */
export function nameValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nameRegex.test(control.value) ? null : { name: true };
}

/**
 * Name validation message
 */
export function nameValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return `${field.props?.label || 'This field'} can only contain letters, spaces, hyphens and apostrophes`;
}

/**
 * License number validator (6-12 uppercase letters or numbers)
 */
export function licenseNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  
  const licenseRegex = /^[A-Z0-9]{6,12}$/;
  return licenseRegex.test(control.value) ? null : { licenseNumber: true };
}

/**
 * License number validation message
 */
export function licenseNumberValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return 'License number must be 6-12 uppercase letters or numbers';
}

/**
 * Required validation message
 */
export function requiredValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return `${field.props?.label || 'This field'} is required`;
}

