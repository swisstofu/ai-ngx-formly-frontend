import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormlyFieldConfig, FormlyModule} from '@ngx-formly/core';
import {FormlyPrimeNGModule} from '@ngx-formly/primeng';
import {of, throwError} from 'rxjs';
import {DynamicFormComponent} from '../../src/app/dynamic-form/dynamic-form.component';
import {FormApiService} from '../../src/app/services/form-api.service';
import {FormlyConfigService} from '../../src/app/services/formly-config.service';

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;
  let formApiService: jest.Mocked<FormApiService>;

  const mockFormConfig = {
    fields: [
      {
        key: 'firstName',
        type: 'input',
        props: {
          label: 'First Name',
          required: true,
          minLength: 2
        }
      },
      {
        key: 'email',
        type: 'input',
        props: {
          label: 'Email',
          type: 'email',
          required: true
        }
      },
      {
        key: 'age',
        type: 'input',
        props: {
          label: 'Age',
          type: 'number'
        },
        expressions: {
          'props.required': {
            jsonLogic: {
              '===': [{var: 'model.country'}, 'us']
            }
          }
        }
      },
      {
        key: 'hasLicense',
        type: 'checkbox',
        props: {
          label: 'Has License'
        },
        expressions: {
          hide: {
            jsonLogic: {
              '<': [{var: 'model.age'}, 16]
            }
          }
        }
      }
    ],
    validationMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email address'
    }
  };

  beforeEach(async () => {
    const mockFormApiService = {
      getFormConfig: jest.fn(),
      submitForm: jest.fn()
    };

    const mockFormlyConfigService = {
      registerValidationMessages: jest.fn(),
      registerDefaultValidationMessages: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        DynamicFormComponent,
        ReactiveFormsModule,
        FormlyModule.forRoot(),
        FormlyPrimeNGModule
      ],
      providers: [
        {provide: FormApiService, useValue: mockFormApiService},
        {provide: FormlyConfigService, useValue: mockFormlyConfigService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    formApiService = TestBed.inject(FormApiService) as jest.Mocked<FormApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form and model', () => {
    expect(component.form).toBeInstanceOf(FormGroup);
    expect(component.model).toEqual({});
    expect(component.fields).toEqual([]);
    expect(component.formSubmitted).toBe(false);
  });

  it('should load form configuration on init', () => {
    formApiService.getFormConfig.mockReturnValue(of(mockFormConfig));

    fixture.detectChanges();

    expect(formApiService.getFormConfig).toHaveBeenCalledWith('form-config');
    expect(component.fields.length).toBe(4);
    expect(component.fields[0].key).toBe('firstName');
  });

  it('should load form configuration with custom configName', () => {
    formApiService.getFormConfig.mockReturnValue(of(mockFormConfig));
    component.configName = 'registration';

    fixture.detectChanges();

    expect(formApiService.getFormConfig).toHaveBeenCalledWith('registration');
  });

  it('should handle HTTP error when loading config', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {
    });
    formApiService.getFormConfig.mockReturnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();

    expect(console.error).toHaveBeenCalled();
  });

  describe('processFieldsWithJsonLogic', () => {
    beforeEach(() => {
      formApiService.getFormConfig.mockReturnValue(of(mockFormConfig));
      fixture.detectChanges();
    });

    it('should process fields without expressions', () => {
      const field = component.fields.find(f => f.key === 'firstName');
      expect(field).toBeDefined();
      // Fields without expressions won't have the expressions property or it will be empty/undefined
      if (field?.expressions) {
        expect(Object.keys(field.expressions).length).toBe(0);
      }
    });

    it('should convert JSON Logic expressions to functions', () => {
      const field = component.fields.find(f => f.key === 'age');
      expect(field).toBeDefined();
      expect(field?.expressions).toBeDefined();
      expect(typeof field?.expressions?.['props.required']).toBe('function');
    });

    it('should evaluate hide expression based on model', () => {
      const field = component.fields.find(f => f.key === 'hasLicense');
      expect(field).toBeDefined();
      expect(field?.expressions?.hide).toBeDefined();

      // Test with age < 16 (should hide)
      let mockField: FormlyFieldConfig = {
        ...field!,
        model: {age: 15},
        options: component.options
      };
      const hideExpr = field?.expressions?.hide;
      if (typeof hideExpr === 'function') {
        const hideResult = hideExpr(mockField);
        expect(hideResult).toBe(true);

        // Test with age >= 16 (should not hide)
        mockField = {...mockField, model: {age: 18}};
        const showResult = hideExpr(mockField);
        expect(showResult).toBe(false);
      }
    });

    it('should evaluate required expression based on model', () => {
      const field = component.fields.find(f => f.key === 'age');
      expect(field).toBeDefined();

      // Test with country = 'us' (should be required)
      let mockField: FormlyFieldConfig = {
        ...field!,
        model: {country: 'us'},
        options: component.options
      };
      const requiredExpr = field?.expressions?.['props.required'];
      if (typeof requiredExpr === 'function') {
        const requiredResult = requiredExpr(mockField);
        expect(requiredResult).toBe(true);

        // Test with country != 'us' (should not be required)
        mockField = {...mockField, model: {country: 'ca'}};
        const notRequiredResult = requiredExpr(mockField);
        expect(notRequiredResult).toBe(false);
      }
    });

    it('should handle JSON Logic errors gracefully', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {
      });

      const fieldWithBadLogic = {
        key: 'test',
        type: 'input',
        expressions: {
          hide: {
            jsonLogic: {
              invalidOperator: [{var: 'model.test'}]
            }
          }
        }
      };

      const processed = (component as any).processFieldsWithJsonLogic([fieldWithBadLogic]);
      const field = processed[0];

      const mockField: FormlyFieldConfig = {
        ...field,
        model: {},
        options: component.options
      };

      // Should return false on error
      const hideExpr = field.expressions?.hide;
      if (typeof hideExpr === 'function') {
        const result = hideExpr(mockField);
        expect(result).toBe(false);
      }
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      formApiService.getFormConfig.mockReturnValue(of(mockFormConfig));
      fixture.detectChanges();
    });

    it('should set formSubmitted to true', () => {
      component.onSubmit();
      expect(component.formSubmitted).toBe(true);
    });

    it('should mark all form controls as touched', () => {
      component.model = {firstName: 'John'};
      fixture.detectChanges();

      const firstNameControl = component.form.get('firstName');
      expect(firstNameControl?.touched).toBeFalsy();

      component.onSubmit();

      expect(firstNameControl?.touched).toBe(true);
    });

    it('should submit form to backend when valid', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {
      });
      formApiService.submitForm.mockReturnValue(of({message: 'Form submitted successfully!'}));

      const submittedData = {
        firstName: 'John',
        email: 'john@example.com'
      };
      component.model = submittedData;
      fixture.detectChanges();

      component.onSubmit();

      expect(formApiService.submitForm).toHaveBeenCalledWith('form-config', submittedData);
      expect(component.isSubmitting).toBe(false);
      expect(component.formSubmitted).toBe(false);
      expect(component.model).toEqual({});
      expect(console.log).toHaveBeenCalledWith('Form submitted with values:', submittedData);
    });

    it('should keep formSubmitted true when form is invalid', () => {
      component.model = {}; // Empty model - required fields missing
      fixture.detectChanges();

      component.onSubmit();

      expect(component.formSubmitted).toBe(true);
    });

    it('should log form errors when invalid', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {
      });

      component.model = {};
      fixture.detectChanges();

      component.onSubmit();

      expect(console.log).toHaveBeenCalledWith('Form is invalid');
      expect(console.log).toHaveBeenCalledWith('Form errors:', expect.any(Object));
    });
  });

  describe('resetForm', () => {
    beforeEach(() => {
      formApiService.getFormConfig.mockReturnValue(of(mockFormConfig));
      fixture.detectChanges();
    });

    it('should reset model to empty object', () => {
      component.model = {firstName: 'John', email: 'john@example.com'};
      component.resetForm();
      expect(component.model).toEqual({});
    });

    it('should reset form controls', () => {
      component.model = {firstName: 'John'};
      fixture.detectChanges();

      const firstNameControl = component.form.get('firstName');
      expect(firstNameControl?.value).toBeTruthy();

      component.resetForm();
      fixture.detectChanges();

      expect(firstNameControl?.value).toBeFalsy();
    });

    it('should reset formSubmitted flag', () => {
      component.formSubmitted = true;
      component.resetForm();
      expect(component.formSubmitted).toBe(false);
    });

    it('should reset parentForm submitted state', () => {
      component.options.parentForm.submitted = true;
      component.resetForm();
      expect(component.options.parentForm.submitted).toBe(false);
    });
  });
});

