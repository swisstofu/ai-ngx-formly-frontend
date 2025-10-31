import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

/**
 * Response interface for form configuration
 */
export interface FormConfigResponse {
  fields: any[];
  validationMessages?: Record<string, string>;
}

/**
 * Response interface for form submission
 */
export interface FormSubmitResponse {
  message?: string;

  [key: string]: any;
}

/**
 * Service to handle all form-related API calls
 * Following Angular best practices by separating API logic from components
 */
@Injectable({
  providedIn: 'root'
})
export class FormApiService {
  private readonly API_BASE_URL = 'http://localhost:8080/api/forms';

  constructor(private http: HttpClient) {
  }

  /**
   * Fetches the form configuration from the backend
   * @param configName Optional name of the form configuration to load (defaults to 'default')
   * @returns Observable of FormConfigResponse containing field definitions
   */
  getFormConfig(configName: string): Observable<FormConfigResponse> {
    return this.http.get<FormConfigResponse>(`${this.API_BASE_URL}/config/${configName}`);
  }

  /**
   * Submits form data to the backend
   * @param configName The name of the form configuration used for validation
   * @param formData The form data to submit
   * @returns Observable of FormSubmitResponse containing the server response
   */
  submitForm(configName: string, formData: any): Observable<FormSubmitResponse> {
    return this.http.post<FormSubmitResponse>(`${this.API_BASE_URL}/submit/${configName}`, formData);
  }
}

