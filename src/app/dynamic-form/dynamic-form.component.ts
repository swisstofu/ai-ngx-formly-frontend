import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core';
import {FormlyPrimeNGModule} from '@ngx-formly/primeng';
import * as jsonLogic from 'json-logic-js';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {FormApiService} from '../services/form-api.service';
import {FormlyConfigService} from '../services/formly-config.service';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyPrimeNGModule,
    CardModule,
    ButtonModule,
    MessageModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css'],
})
export class DynamicFormComponent implements OnInit {
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];
  formSubmitted = false;
  isSubmitting = false;
  configName: string = 'form-config'; // Track the config name for submission
  options: any = {
    formState: {
      showErrorState: true,
    },
    parentForm: {
      submitted: false,
    },
  };

  constructor(
    private formApiService: FormApiService,
    private messageService: MessageService,
    private formlyConfigService: FormlyConfigService
  ) {
  }

  ngOnInit() {
    // Load form configuration from backend API
    // You can change 'default' to load different form configurations
    this.formApiService.getFormConfig(this.configName).subscribe({
      next: (config) => {
        // Register validation messages from server if provided
        if (config.validationMessages && Object.keys(config.validationMessages).length > 0) {
          this.formlyConfigService.registerValidationMessages(config.validationMessages);
        } else {
          // Register default validation messages if none provided by server
          this.formlyConfigService.registerDefaultValidationMessages();
        }

        this.fields = this.processFieldsWithJsonLogic(config.fields);
      },
      error: (error) => {
        console.error('Error loading form configuration:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Configuration Error',
          detail: 'Failed to load form configuration. Please try again later.',
          life: 5000
        });
      }
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    this.options.parentForm = {submitted: true};
    this.markFormGroupTouched(this.form);

    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form submitted with values:', this.model);

      // Submit to backend API
      this.formApiService.submitForm(this.configName, this.model).subscribe({
        next: (response) => {
          console.log('Backend response:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Form submitted successfully!',
            life: 5000
          });

          // Reset form after successful submission
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Backend error:', error);
          this.isSubmitting = false;

          let errorMessage = 'An error occurred while submitting the form.';

          if (error.error?.fieldErrors) {
            // Handle field-specific validation errors
            const fieldErrors = error.error.fieldErrors;
            const errorList = Object.keys(fieldErrors)
              .map(field => `${field}: ${fieldErrors[field]}`)
              .join('\n');
            errorMessage = `Validation errors:\n${errorList}`;
          } else if (error.error?.errors) {
            // Handle JSON Logic validation errors
            errorMessage = error.error.errors.join('\n');
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Submission Failed',
            detail: errorMessage,
            life: 8000
          });
        }
      });
    } else {
      console.log('Form is invalid');
      console.log('Form errors:', this.getFormErrors());
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fix all validation errors before submitting.',
        life: 5000
      });
    }
  }

  resetForm() {
    this.model = {};
    this.form.reset();
    this.formSubmitted = false;
    this.options.parentForm = {submitted: false};
  }

  private processFieldsWithJsonLogic(
    fields: any[]
  ): FormlyFieldConfig[] {
    return fields.map((field) => {
      const processedField: FormlyFieldConfig = {...field};
      // Normalize HTML pattern in props if provided by server to avoid invalid charclass (eg, trailing hyphen)
      if ((processedField as any).props && typeof (processedField as any).props.pattern === 'string') {
        (processedField as any).props.pattern = this.formlyConfigService.normalizeRegexPattern(
          (processedField as any).props.pattern
        );
      }

      // Process expressions (visibility, required, disabled)
      if (field.expressions) {
        const expressions: any = {};

        Object.keys(field.expressions).forEach((key) => {
          const expression = field.expressions[key];

          if (expression.jsonLogic) {
            // Convert JSON Logic to Formly expression function
            expressions[key] = (field: FormlyFieldConfig) => {
              try {
                const result: FormlyFieldConfig[] = jsonLogic.apply(expression.jsonLogic, {
                  model: field.model,
                  formState: field.options?.formState,
                });
                return result;
              } catch (error) {
                console.error('Error evaluating JSON Logic:', error);
                return false;
              }
            };
          }
        });

        // Only set expressions if we actually have any
        if (Object.keys(expressions).length > 0) {
          processedField.expressions = expressions;
        } else {
          // Remove empty expressions object
          delete processedField.expressions;
        }
      }

      return processedField;
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}

