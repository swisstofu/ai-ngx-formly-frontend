import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideFormlyCore } from '@ngx-formly/core';
import { FormlyFieldInput } from '@ngx-formly/primeng/input';
import { FormlyFieldTextArea } from '@ngx-formly/primeng/textarea';
import { FormlyFieldCheckbox } from '@ngx-formly/primeng/checkbox';
import { FormlyFieldSelect } from '@ngx-formly/primeng/select';

import { routes } from './app.routes';
import {
  emailValidator,
  emailValidatorMessage,
  minLengthValidatorMessage,
  maxLengthValidatorMessage,
  minValidatorMessage,
  maxValidatorMessage,
  patternValidatorMessage,
  nameValidator,
  nameValidatorMessage,
  licenseNumberValidator,
  licenseNumberValidatorMessage,
  requiredValidatorMessage
} from './dynamic-form/validators';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideFormlyCore({
      types: [
        { name: 'input', component: FormlyFieldInput },
        { name: 'textarea', component: FormlyFieldTextArea },
        { name: 'checkbox', component: FormlyFieldCheckbox },
        { name: 'select', component: FormlyFieldSelect },
      ],
      validators: [
        { name: 'email', validation: emailValidator },
        { name: 'name', validation: nameValidator },
        { name: 'licenseNumber', validation: licenseNumberValidator },
      ],
      validationMessages: [
        { name: 'required', message: requiredValidatorMessage },
        { name: 'email', message: emailValidatorMessage },
        { name: 'minLength', message: minLengthValidatorMessage },
        { name: 'maxLength', message: maxLengthValidatorMessage },
        { name: 'min', message: minValidatorMessage },
        { name: 'max', message: maxValidatorMessage },
        { name: 'pattern', message: patternValidatorMessage },
        { name: 'name', message: nameValidatorMessage },
        { name: 'licenseNumber', message: licenseNumberValidatorMessage },
      ],
      extras: {
        showError: (field: any) => {
          return field.formControl?.invalid && (field.formControl?.touched || field.options?.parentForm?.submitted);
        }
      }
    })
  ]
};
