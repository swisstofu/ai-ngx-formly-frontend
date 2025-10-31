# AiNgxFormly

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with [Jest](https://jestjs.io/), use the following command:

```bash
npm test
```

Tests are located in the `tests/unit/` directory and follow the pattern `*.spec.ts`.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Project Structure

```
src/
├── app/
│   ├── dynamic-form/          # Dynamic form component with JSON Logic
│   │   ├── dynamic-form.component.ts
│   │   ├── dynamic-form.component.html
│   │   ├── dynamic-form.component.css
│   │   └── validators.ts
│   ├── services/
│   │   └── form-api.service.ts # API service for form operations
│   └── app.config.ts           # Application configuration
tests/
└── unit/                       # Unit tests
    ├── app.spec.ts
    ├── dynamic-form.component.spec.ts
    ├── validators.spec.ts
    └── json-logic-rules.spec.ts
```

## Dynamic Form Component

### Overview

The Dynamic Form component loads form configuration from a backend API and uses JSON Logic to control field visibility, required validation, disabled states, and custom validation rules.

### How It Works

#### 1. Configuration Source
The form configuration is fetched from the backend API via `FormApiService`:
- Endpoint: `http://localhost:8080/api/forms/config`
- Returns field definitions (type, key, props) and JSON Logic expressions for dynamic behavior

#### 2. Loading Process
1. Component calls `FormApiService.getFormConfig()` on initialization
2. The `processFieldsWithJsonLogic()` method converts JSON Logic expressions to Formly expression functions
3. Formly renders the form with dynamic behavior

#### 3. JSON Logic Expressions

The configuration supports three types of expressions:

##### Visibility (`hide`)
Controls whether a field is visible:
```json
{
  "expressions": {
    "hide": {
      "jsonLogic": {
        "!": {
          "in": [{ "var": "model.country" }, ["us", "ca"]]
        }
      }
    }
  }
}
```

##### Required Validation (`props.required`)
Controls whether a field is required:
```json
{
  "expressions": {
    "props.required": {
      "jsonLogic": {
        "===": [{ "var": "model.country" }, "us"]
      }
    }
  }
}
```

##### Disabled State (`props.disabled`)
Controls whether a field is disabled:
```json
{
  "expressions": {
    "props.disabled": {
      "jsonLogic": {
        "<": [{ "var": "model.age" }, 18]
      }
    }
  }
}
```

### JSON Logic Operators

Common operators used in the configuration:

- `===`, `==`, `!=` - Equality comparisons
- `<`, `>`, `<=`, `>=` - Numeric comparisons
- `in` - Check if value is in array
- `!` - Logical NOT
- `and`, `or` - Logical AND/OR
- `var` - Access model values

### Modifying the Form

To modify the form, update the backend API response at `http://localhost:8080/api/forms/config`:

1. **Add a new field**: Add a new object to the `fields` array in the API response
2. **Add conditional logic**: Add an `expressions` object with JSON Logic rules
3. **Change field properties**: Modify the `props` object

The changes will be picked up automatically when you refresh the browser (the component fetches fresh configuration on load).

### Example: Adding a New Field

```json
{
  "key": "phoneNumber",
  "type": "input",
  "props": {
    "label": "Phone Number",
    "placeholder": "Enter phone number",
    "type": "tel"
  },
  "expressions": {
    "props.required": {
      "jsonLogic": {
        "===": [{ "var": "model.country" }, "us"]
      }
    }
  }
}
```

## Validation System

### Architecture

The validation system uses **server-driven validators** for maximum flexibility and maintainability:

1. **ValidatorRegistryService** (`src/app/services/validator-registry.service.ts`) - Manages validator registration and built-in validators
2. **FormlyConfigService** (`src/app/services/formly-config.service.ts`) - Bridges validators with Formly configuration
3. **Backend API** - Returns validator definitions in form configuration response
4. **DynamicFormComponent** - Registers validators from server on form load

**Key Benefit**: Validators are now defined on the server, allowing you to change validation rules without modifying frontend code.

### Server Configuration Format

The backend API should return validators and validation messages in the form configuration:

```json
{
  "fields": [...],
  "validators": [
    {
      "name": "email",
      "type": "builtin"
    },
    {
      "name": "pattern",
      "type": "pattern",
      "config": {
        "pattern": "^[a-zA-Z0-9]+$"
      }
    }
  ],
  "validationMessages": [
    {
      "name": "email",
      "message": "Please enter a valid email address"
    },
    {
      "name": "required",
      "message": "This field is required"
    }
  ]
}
```

### Adding Validators to Fields

Validators are referenced by name in the JSON configuration:

```json
{
  "key": "email",
  "type": "input",
  "props": {
    "label": "Email",
    "required": true
  },
  "validators": {
    "email": {}
  }
}
```

### Built-in Validators (via props)

Angular's built-in validators work automatically through props:

```json
{
  "key": "firstName",
  "type": "input",
  "props": {
    "label": "First Name",
    "required": true,
    "minLength": 2,
    "maxLength": 50,
    "min": 0,
    "max": 120
  }
}
```

### Custom Validators

Custom validators are registered in `app.config.ts` and defined in `validators.ts`:

#### 1. **email** - Email format validation
```json
"validators": {
  "email": {}
}
```

#### 2. **name** - Name validation (letters, spaces, hyphens, apostrophes)
```json
"validators": {
  "name": {}
}
```

#### 3. **licenseNumber** - License number validation (6-12 uppercase alphanumeric)
```json
"validators": {
  "licenseNumber": {}
}
```

### Adding New Validators

#### Option 1: Use Built-in Validators (Recommended)

Built-in validators are already registered and can be used immediately by including them in the server response:

```json
{
  "validators": [
    { "name": "email", "type": "builtin" },
    { "name": "name", "type": "builtin" },
    { "name": "licenseNumber", "type": "builtin" },
    { "name": "pattern", "type": "pattern", "config": { "pattern": "^[0-9]{3}-[0-9]{3}-[0-9]{4}$" } }
  ]
}
```

#### Option 2: Add Custom Validators (Frontend)

To add a new custom validator:

1. **Register in `ValidatorRegistryService`:**
```typescript
// In src/app/services/validator-registry.service.ts
private registerBuiltInValidators(): void {
  // ... existing validators ...

  this.registerValidator('phone', (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(control.value) ? null : { phone: true };
  });
}
```

2. **Register validation message:**
```typescript
this.registerValidationMessage('phone', () => {
  return 'Please enter a valid phone number';
});
```

3. **Use in server response:**
```json
{
  "validators": [
    { "name": "phone", "type": "builtin" }
  ],
  "validationMessages": [
    { "name": "phone", "message": "Please enter a valid phone number" }
  ]
}
```

4. **Use in field configuration:**
```json
{
  "key": "phone",
  "type": "input",
  "props": {
    "label": "Phone Number"
  },
  "validators": {
    "phone": {}
  }
}
```

### Validation Behavior

- **On Submit**: When the user clicks Submit, all fields are validated
- **Error Display**: Invalid fields show red borders and error messages below the field
- **Form-level Error**: A message appears at the top if the form has validation errors
- **Touch State**: Fields are marked as touched on submit to trigger error display
- **Real-time**: Validation runs as the user types (after first touch)

### Error Message Display

Error messages are displayed:
1. Below each invalid field (red text)
2. At the top of the form (PrimeNG message component)
3. In the browser console (for debugging)

## API Integration

### FormApiService

The application uses `FormApiService` to communicate with the backend:

- **Service**: `src/app/services/form-api.service.ts`
- **Methods**:
  - `getFormConfig()`: Fetches form configuration from `/api/forms/config`
  - `submitForm(formData)`: Submits form data to `/api/forms/submit`

### Form Configuration Response Format

The `/api/forms/config` endpoint should return:

```typescript
{
  fields: FormlyFieldConfig[];
  validators?: ValidatorDefinition[];
  validationMessages?: ValidationMessageDefinition[];
}
```

**Example Response:**

```json
{
  "fields": [
    {
      "key": "firstName",
      "type": "input",
      "props": {
        "label": "First Name",
        "required": true,
        "minLength": 2
      }
    },
    {
      "key": "email",
      "type": "input",
      "props": {
        "label": "Email",
        "required": true
      },
      "validators": {
        "email": {}
      }
    }
  ],
  "validators": [
    { "name": "email", "type": "builtin" },
    { "name": "name", "type": "builtin" }
  ],
  "validationMessages": [
    { "name": "required", "message": "This field is required" },
    { "name": "email", "message": "Please enter a valid email address" }
  ]
}
```

The service handles all HTTP communication, making components cleaner and more testable.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
