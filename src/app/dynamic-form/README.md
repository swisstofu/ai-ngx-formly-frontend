# Dynamic Form with JSON Logic and Validation

This component loads form configuration from a backend API and uses JSON Logic to control field visibility, required validation, disabled states, and custom validation rules.

## How It Works

### 1. Configuration Source
The form configuration is fetched from the backend API via `FormApiService`:
- Endpoint: `http://localhost:8080/api/forms/config`
- Returns field definitions (type, key, props) and JSON Logic expressions for dynamic behavior

### 2. Loading Process
1. Component calls `FormApiService.getFormConfig()` on initialization
2. The `processFieldsWithJsonLogic()` method converts JSON Logic expressions to Formly expression functions
3. Formly renders the form with dynamic behavior

### 3. JSON Logic Expressions

The configuration supports three types of expressions:

#### Visibility (`hide`)
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

#### Required Validation (`props.required`)
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

#### Disabled State (`props.disabled`)
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

## JSON Logic Operators

Common operators used in the configuration:

- `===`, `==`, `!=` - Equality comparisons
- `<`, `>`, `<=`, `>=` - Numeric comparisons
- `in` - Check if value is in array
- `!` - Logical NOT
- `and`, `or` - Logical AND/OR
- `var` - Access model values

## Modifying the Form

To modify the form, update the backend API response at `http://localhost:8080/api/forms/config`:

1. **Add a new field**: Add a new object to the `fields` array in the API response
2. **Add conditional logic**: Add an `expressions` object with JSON Logic rules
3. **Change field properties**: Modify the `props` object

The changes will be picked up automatically when you refresh the browser (the component fetches fresh configuration on load).

## Example: Adding a New Field

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

The validation system uses **globally registered validators** in `app.config.ts` for maximum reusability and maintainability:

1. **validators.ts** - Contains all validator functions and messages
2. **app.config.ts** - Registers validators globally via `provideFormlyCore()`
3. **form-config.json** - References validators by name

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

To add a new validator:

1. **Create validator function in `validators.ts`:**
```typescript
export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(control.value) ? null : { phone: true };
}

export function phoneValidatorMessage(error: any, field: FormlyFieldConfig): string {
  return 'Please enter a valid phone number';
}
```

2. **Register in `app.config.ts`:**
```typescript
provideFormlyCore({
  validators: [
    { name: 'phone', validation: phoneValidator },
  ],
  validationMessages: [
    { name: 'phone', message: phoneValidatorMessage },
  ],
})
```

3. **Use in JSON:**
```json
{
  "key": "phone",
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

## Files

- `dynamic-form.component.ts` - Component that loads and processes the configuration
- `dynamic-form.component.html` - Template for rendering the form
- `dynamic-form.component.css` - Styles for the form including error styling
- `validators.ts` - Custom validators for form fields

## API Integration

The component uses `FormApiService` to communicate with the backend:

- **Service**: `src/app/services/form-api.service.ts`
- **Methods**:
  - `getFormConfig()`: Fetches form configuration from `/api/forms/config`
  - `submitForm(formData)`: Submits form data to `/api/forms/submit`

The service handles all HTTP communication, making the component cleaner and more testable.

