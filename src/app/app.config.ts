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
import { FormlyConfigService } from './services/formly-config.service';

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
    FormlyConfigService,
    provideFormlyCore({
      types: [
        { name: 'input', component: FormlyFieldInput },
        { name: 'textarea', component: FormlyFieldTextArea },
        { name: 'checkbox', component: FormlyFieldCheckbox },
        { name: 'select', component: FormlyFieldSelect },
      ],
      extras: {
        showError: (field: any) => {
          return field.formControl?.invalid && (field.formControl?.touched || field.options?.parentForm?.submitted);
        }
      }
    })
  ]
};
