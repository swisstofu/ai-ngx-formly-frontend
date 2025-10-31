import * as jsonLogic from 'json-logic-js';

describe('JSON Logic Rules', () => {
  // Helper to apply JSON logic with proper typing
  const applyLogic = (rule: any, data: any): any => {
    return jsonLogic.apply(rule as any, data);
  };
  describe('Visibility Rules (hide expression)', () => {
    it('should hide field when age is less than 16', () => {
      const rule = {
        '<': [{ var: 'model.age' }, 16]
      };

      const result1 = applyLogic(rule, { model: { age: 15 } });
      expect(result1).toBe(true); // Should hide

      const result2 = applyLogic(rule, { model: { age: 16 } });
      expect(result2).toBe(false); // Should not hide

      const result3 = applyLogic(rule, { model: { age: 18 } });
      expect(result3).toBe(false); // Should not hide
    });

    it('should hide field when hasLicense is false', () => {
      const rule = {
        '!': { var: 'model.hasLicense' }
      };

      const result1 = applyLogic(rule, { model: { hasLicense: false } });
      expect(result1).toBe(true); // Should hide

      const result2 = applyLogic(rule, { model: { hasLicense: true } });
      expect(result2).toBe(false); // Should not hide
    });

    it('should hide field when country is not in list', () => {
      const rule = {
        '!': {
          in: [{ var: 'model.country' }, ['us', 'ca']]
        }
      };

      const result1 = applyLogic(rule, { model: { country: 'uk' } });
      expect(result1).toBe(true); // Should hide

      const result2 = applyLogic(rule, { model: { country: 'us' } });
      expect(result2).toBe(false); // Should not hide

      const result3 = applyLogic(rule, { model: { country: 'ca' } });
      expect(result3).toBe(false); // Should not hide
    });

    it('should hide field when employment status is not employed or self-employed', () => {
      const rule = {
        '!': {
          in: [
            { var: 'model.employmentStatus' },
            ['employed', 'self-employed']
          ]
        }
      };

      const result1 = applyLogic(rule, { model: { employmentStatus: 'unemployed' } });
      expect(result1).toBe(true); // Should hide

      const result2 = applyLogic(rule, { model: { employmentStatus: 'employed' } });
      expect(result2).toBe(false); // Should not hide

      const result3 = applyLogic(rule, { model: { employmentStatus: 'self-employed' } });
      expect(result3).toBe(false); // Should not hide
    });

    it('should hide annual income when employment status is not in specific list', () => {
      const rule = {
        '!': {
          in: [
            { var: 'model.employmentStatus' },
            ['employed', 'self-employed', 'retired']
          ]
        }
      };

      const result1 = applyLogic(rule, { model: { employmentStatus: 'student' } });
      expect(result1).toBe(true); // Should hide

      const result2 = applyLogic(rule, { model: { employmentStatus: 'retired' } });
      expect(result2).toBe(false); // Should not hide
    });
  });

  describe('Required Validation Rules (props.required expression)', () => {
    it('should make age required when country is US', () => {
      const rule = {
        '===': [{ var: 'model.country' }, 'us']
      };

      const result1 = applyLogic(rule, { model: { country: 'us' } });
      expect(result1).toBe(true); // Should be required

      const result2 = applyLogic(rule, { model: { country: 'ca' } });
      expect(result2).toBe(false); // Should not be required
    });

    it('should make license number required when hasLicense is true', () => {
      const rule = {
        '==': [{ var: 'model.hasLicense' }, true]
      };

      const result1 = applyLogic(rule, { model: { hasLicense: true } });
      expect(result1).toBe(true); // Should be required

      const result2 = applyLogic(rule, { model: { hasLicense: false } });
      expect(result2).toBe(false); // Should not be required
    });

    it('should make company name required when employment status is employed or self-employed', () => {
      const rule = {
        in: [
          { var: 'model.employmentStatus' },
          ['employed', 'self-employed']
        ]
      };

      const result1 = applyLogic(rule, { model: { employmentStatus: 'employed' } });
      expect(result1).toBe(true); // Should be required

      const result2 = applyLogic(rule, { model: { employmentStatus: 'self-employed' } });
      expect(result2).toBe(true); // Should be required

      const result3 = applyLogic(rule, { model: { employmentStatus: 'unemployed' } });
      expect(result3).toBe(false); // Should not be required
    });

    it('should make annual income required when employed/self-employed/retired AND age >= 18', () => {
      const rule = {
        and: [
          {
            in: [
              { var: 'model.employmentStatus' },
              ['employed', 'self-employed', 'retired']
            ]
          },
          { '>=': [{ var: 'model.age' }, 18] }
        ]
      };

      const result1 = applyLogic(rule, {
        model: { employmentStatus: 'employed', age: 25 }
      });
      expect(result1).toBe(true); // Should be required

      const result2 = applyLogic(rule, {
        model: { employmentStatus: 'employed', age: 16 }
      });
      expect(result2).toBe(false); // Should not be required (age < 18)

      const result3 = applyLogic(rule, {
        model: { employmentStatus: 'student', age: 25 }
      });
      expect(result3).toBe(false); // Should not be required (wrong employment status)

      const result4 = applyLogic(rule, {
        model: { employmentStatus: 'retired', age: 65 }
      });
      expect(result4).toBe(true); // Should be required
    });
  });

  describe('Disabled State Rules (props.disabled expression)', () => {
    it('should disable employment status when age is less than 18', () => {
      const rule = {
        '<': [{ var: 'model.age' }, 18]
      };

      const result1 = applyLogic(rule, { model: { age: 16 } });
      expect(result1).toBe(true); // Should be disabled

      const result2 = applyLogic(rule, { model: { age: 18 } });
      expect(result2).toBe(false); // Should not be disabled

      const result3 = applyLogic(rule, { model: { age: 25 } });
      expect(result3).toBe(false); // Should not be disabled
    });
  });

  describe('Complex JSON Logic Operations', () => {
    it('should handle OR operations', () => {
      const rule = {
        or: [
          { '===': [{ var: 'model.country' }, 'us'] },
          { '===': [{ var: 'model.country' }, 'ca'] }
        ]
      };

      expect(applyLogic(rule, { model: { country: 'us' } })).toBe(true);
      expect(applyLogic(rule, { model: { country: 'ca' } })).toBe(true);
      expect(applyLogic(rule, { model: { country: 'uk' } })).toBe(false);
    });

    it('should handle nested AND/OR operations', () => {
      const rule = {
        and: [
          {
            or: [
              { '===': [{ var: 'model.employmentStatus' }, 'employed'] },
              { '===': [{ var: 'model.employmentStatus' }, 'self-employed'] }
            ]
          },
          { '>=': [{ var: 'model.age' }, 18] }
        ]
      };

      expect(applyLogic(rule, {
        model: { employmentStatus: 'employed', age: 25 }
      })).toBe(true);

      expect(applyLogic(rule, {
        model: { employmentStatus: 'self-employed', age: 30 }
      })).toBe(true);

      expect(applyLogic(rule, {
        model: { employmentStatus: 'employed', age: 16 }
      })).toBe(false);

      expect(applyLogic(rule, {
        model: { employmentStatus: 'unemployed', age: 25 }
      })).toBe(false);
    });

    it('should handle comparison operators', () => {
      const greaterThan = { '>': [{ var: 'model.value' }, 10] };
      expect(applyLogic(greaterThan, { model: { value: 15 } })).toBe(true);
      expect(applyLogic(greaterThan, { model: { value: 10 } })).toBe(false);

      const lessThanOrEqual = { '<=': [{ var: 'model.value' }, 10] };
      expect(applyLogic(lessThanOrEqual, { model: { value: 10 } })).toBe(true);
      expect(applyLogic(lessThanOrEqual, { model: { value: 5 } })).toBe(true);
      expect(applyLogic(lessThanOrEqual, { model: { value: 15 } })).toBe(false);
    });

    it('should handle NOT operations', () => {
      const notRule = { '!': { var: 'model.isActive' } };

      expect(applyLogic(notRule, { model: { isActive: false } })).toBe(true);
      expect(applyLogic(notRule, { model: { isActive: true } })).toBe(false);
    });

    it('should handle IN operations with arrays', () => {
      const inRule = {
        in: [{ var: 'model.status' }, ['active', 'pending', 'approved']]
      };

      expect(applyLogic(inRule, { model: { status: 'active' } })).toBe(true);
      expect(applyLogic(inRule, { model: { status: 'pending' } })).toBe(true);
      expect(applyLogic(inRule, { model: { status: 'rejected' } })).toBe(false);
    });

    it('should handle missing/undefined values', () => {
      const rule = { '===': [{ var: 'model.country' }, 'us'] };

      expect(applyLogic(rule, { model: {} })).toBe(false);
      expect(applyLogic(rule, { model: { country: null } })).toBe(false);
      expect(applyLogic(rule, { model: { country: undefined } })).toBe(false);
    });

    it('should handle default values with missing data', () => {
      const rule = { '===': [{ var: ['model.country', 'unknown'] }, 'unknown'] };

      expect(applyLogic(rule, { model: {} })).toBe(true);
      expect(applyLogic(rule, { model: { country: 'us' } })).toBe(false);
    });
  });

  describe('Real-world Form Scenarios', () => {
    it('should correctly evaluate cascading visibility rules', () => {
      const model = {
        age: 25,
        hasLicense: true,
        employmentStatus: 'employed'
      };

      // hasLicense should be visible (age >= 16)
      const licenseVisibility = { '<': [{ var: 'model.age' }, 16] };
      expect(applyLogic(licenseVisibility, { model })).toBe(false);

      // licenseNumber should be visible (hasLicense is true)
      const licenseNumberVisibility = { '!': { var: 'model.hasLicense' } };
      expect(applyLogic(licenseNumberVisibility, { model })).toBe(false);

      // companyName should be visible (employmentStatus is employed)
      const companyVisibility = {
        '!': {
          in: [{ var: 'model.employmentStatus' }, ['employed', 'self-employed']]
        }
      };
      expect(applyLogic(companyVisibility, { model })).toBe(false);
    });

    it('should correctly evaluate conditional required fields', () => {
      const model = {
        country: 'us',
        age: 25,
        hasLicense: true,
        employmentStatus: 'employed'
      };

      // age should be required (country is 'us')
      const ageRequired = { '===': [{ var: 'model.country' }, 'us'] };
      expect(applyLogic(ageRequired, { model })).toBe(true);

      // licenseNumber should be required (hasLicense is true)
      const licenseRequired = { '==': [{ var: 'model.hasLicense' }, true] };
      expect(applyLogic(licenseRequired, { model })).toBe(true);

      // annualIncome should be required (employed and age >= 18)
      const incomeRequired = {
        and: [
          {
            in: [
              { var: 'model.employmentStatus' },
              ['employed', 'self-employed', 'retired']
            ]
          },
          { '>=': [{ var: 'model.age' }, 18] }
        ]
      };
      expect(applyLogic(incomeRequired, { model })).toBe(true);
    });
  });
});

