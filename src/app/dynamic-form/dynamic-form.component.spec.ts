import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { DynamicFormComponent } from './dynamic-form.component';

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;
  let httpMock: HttpTestingController;

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
              '===': [{ var: 'model.country' }, 'us']
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
              '<': [{ var: 'model.age' }, 16]
            }
          }
        }
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DynamicFormComponent,
        ReactiveFormsModule,
        FormlyModule.forRoot(),
        FormlyPrimeNGModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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
    fixture.detectChanges();

    const req = httpMock.expectOne('app/dynamic-form/form-config.json');
    expect(req.request.method).toBe('GET');

    req.flush(mockFormConfig);

    expect(component.fields.length).toBe(4);
    expect(component.fields[0].key).toBe('firstName');
  });

  it('should handle HTTP error when loading config', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fixture.detectChanges();

    const req = httpMock.expectOne('app/dynamic-form/form-config.json');
    req.error(new ProgressEvent('error'));

    expect(console.error).toHaveBeenCalled();
  });

  describe('processFieldsWithJsonLogic', () => {
    beforeEach(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('app/dynamic-form/form-config.json');
      req.flush(mockFormConfig);
    });

    it('should process fields without expressions', () => {
      const field = component.fields.find(f => f.key === 'firstName');
      expect(field).toBeDefined();
      expect(field?.expressions).toBeUndefined();
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
        model: { age: 15 },
        options: component.options
      };
      const hideExpr = field?.expressions?.hide;
      if (typeof hideExpr === 'function') {
        const hideResult = hideExpr(mockField);
        expect(hideResult).toBe(true);

        // Test with age >= 16 (should not hide)
        mockField = { ...mockField, model: { age: 18 } };
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
        model: { country: 'us' },
        options: component.options
      };
      const requiredExpr = field?.expressions?.['props.required'];
      if (typeof requiredExpr === 'function') {
        const requiredResult = requiredExpr(mockField);
        expect(requiredResult).toBe(true);

        // Test with country != 'us' (should not be required)
        mockField = { ...mockField, model: { country: 'ca' } };
        const notRequiredResult = requiredExpr(mockField);
        expect(notRequiredResult).toBe(false);
      }
    });

    it('should handle JSON Logic errors gracefully', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const fieldWithBadLogic = {
        key: 'test',
        type: 'input',
        expressions: {
          hide: {
            jsonLogic: {
              invalidOperator: [{ var: 'model.test' }]
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
      fixture.detectChanges();
      const req = httpMock.expectOne('app/dynamic-form/form-config.json');
      req.flush(mockFormConfig);
      fixture.detectChanges();
    });

    it('should set formSubmitted to true', () => {
      component.onSubmit();
      expect(component.formSubmitted).toBe(true);
    });

    it('should mark all form controls as touched', () => {
      component.model = { firstName: 'John' };
      fixture.detectChanges();

      const firstNameControl = component.form.get('firstName');
      expect(firstNameControl?.touched).toBeFalsy();

      component.onSubmit();

      expect(firstNameControl?.touched).toBe(true);
    });

    it('should reset formSubmitted when form is valid', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});

      component.model = {
        firstName: 'John',
        email: 'john@example.com'
      };
      fixture.detectChanges();

      component.onSubmit();

      expect(component.formSubmitted).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Form submitted successfully! Check console for values.');
      expect(console.log).toHaveBeenCalledWith('Form submitted with values:', component.model);
    });

    it('should keep formSubmitted true when form is invalid', () => {
      jest.spyOn(window, 'alert').mockImplementation(() => {});

      component.model = {}; // Empty model - required fields missing
      fixture.detectChanges();

      component.onSubmit();

      expect(component.formSubmitted).toBe(true);
      expect(window.alert).toHaveBeenCalledWith('Please fix all validation errors before submitting.');
    });

    it('should log form errors when invalid', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      component.model = {};
      fixture.detectChanges();

      component.onSubmit();

      expect(console.log).toHaveBeenCalledWith('Form is invalid');
      expect(console.log).toHaveBeenCalledWith('Form errors:', expect.any(Object));
    });
  });

  describe('resetForm', () => {
    beforeEach(() => {
      fixture.detectChanges();
      const req = httpMock.expectOne('app/dynamic-form/form-config.json');
      req.flush(mockFormConfig);
      fixture.detectChanges();
    });

    it('should reset model to empty object', () => {
      component.model = { firstName: 'John', email: 'john@example.com' };
      component.resetForm();
      expect(component.model).toEqual({});
    });

    it('should reset form controls', () => {
      component.model = { firstName: 'John' };
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

