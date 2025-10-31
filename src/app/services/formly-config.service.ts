import { Injectable } from '@angular/core';
import { FormlyConfig } from '@ngx-formly/core';
import { ValidatorRegistryService, ValidatorDefinition, ValidationMessageDefinition } from './validator-registry.service';

/**
 * Service to configure Formly with dynamic validators
 * Bridges between ValidatorRegistry and Formly configuration
 */
@Injectable({
  providedIn: 'root'
})
export class FormlyConfigService {
  constructor(
    private formlyConfig: FormlyConfig,
    private validatorRegistry: ValidatorRegistryService
  ) {}

  /**
   * Register validators with Formly based on server definitions
   */
  registerValidators(validatorDefinitions: ValidatorDefinition[]): void {
    validatorDefinitions.forEach((definition) => {
      const validator = this.validatorRegistry.getValidator(definition.name);
      if (validator) {
        // Create a validator function that includes the config
        const validatorWithConfig = (control: any) => {
          return validator(control, definition.config);
        };

        this.formlyConfig.addValidator({
          name: definition.name,
          validation: validatorWithConfig
        });
      } else {
        console.warn(`Validator '${definition.name}' not found in registry`);
      }
    });
  }

  /**
   * Register validation messages with Formly based on server definitions
   */
  registerValidationMessages(messageDefinitions: ValidationMessageDefinition[]): void {
    messageDefinitions.forEach((definition) => {
      this.formlyConfig.addValidationMessage({
        name: definition.name,
        message: () => definition.message
      });
    });
  }

  /**
   * Register default validation messages
   */
  registerDefaultValidationMessages(): void {
    this.validatorRegistry.registerDefaultValidationMessages();

    const defaultMessages = [
      { name: 'required', message: 'This field is required' },
      { name: 'email', message: 'Please enter a valid email address' },
      { name: 'name', message: 'Can only contain letters, spaces, hyphens and apostrophes' },
      { name: 'licenseNumber', message: 'License number must be 6-12 uppercase letters or numbers' },
      { name: 'minLength', message: 'Minimum length not met' },
      { name: 'maxLength', message: 'Maximum length exceeded' },
      { name: 'min', message: 'Value is too small' },
      { name: 'max', message: 'Value is too large' },
      { name: 'pattern', message: 'Invalid format' }
    ];

    this.registerValidationMessages(defaultMessages);
  }
}

