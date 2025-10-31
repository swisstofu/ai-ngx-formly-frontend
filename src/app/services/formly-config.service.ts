import {Injectable} from '@angular/core';
import {FormlyConfig} from '@ngx-formly/core';

/**
 * Service to configure Formly with dynamic validators
 * Manages validator registration and validation messages from server
 */
@Injectable({
  providedIn: 'root'
})
export class FormlyConfigService {
  constructor(private formlyConfig: FormlyConfig) {
  }

  /**
   * Normalize regex pattern to fix common issues seen in HTML pattern attribute
   * - Escapes a trailing hyphen in a character class (e.g., [a-z'-] -> [a-z'\-])
   *   without disturbing valid ranges like a-z or À-ÿ.
   */
  public normalizeRegexPattern(pattern: string): string {
    try {
      // Only escape hyphens that appear just before the closing bracket.
      // This avoids breaking ranges like a-z or À-ÿ.
      return pattern.replace(/-]/g, '\\-]');
    } catch {
      return pattern;
    }
  }


  /**
   * Register validation messages with Formly based on server definitions
   * @param messages - Object mapping validator names to error messages
   */
  registerValidationMessages(messages: Record<string, string>): void {
    Object.entries(messages).forEach(([name, message]) => {
      this.formlyConfig.addValidatorMessage(name, message);
    });
  }

  /**
   * Register default validation messages for generic validators (in French)
   */
  registerDefaultValidationMessages(): void {
    const defaultMessages: Record<string, string> = {
      required: 'Ce champ est requis',
      minLength: 'Longueur minimale non atteinte',
      maxLength: 'Longueur maximale dépassée',
      min: 'La valeur est trop petite',
      max: 'La valeur est trop grande',
      pattern: 'Format invalide'
    };

    this.registerValidationMessages(defaultMessages);
  }
}

