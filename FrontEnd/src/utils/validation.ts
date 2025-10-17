/**
 * Comprehensive validation utility for forms
 * Provides reusable validation functions with detailed error messages
 */

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  type?: 'string' | 'number' | 'email' | 'phone' | 'array';
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a single field against its validation rules
 */
export const validateField = (value: any, rules: ValidationRule, fieldName: string): FieldValidationResult => {
  // Required validation
  if (rules.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }

  // Skip other validations if field is not required and empty
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return { isValid: true };
  }

  // Type validation
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            isValid: false,
            error: `${fieldName} must be a text value`
          };
        }
        break;
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return {
            isValid: false,
            error: `${fieldName} must be a valid number`
          };
        }
        value = numValue;
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return {
            isValid: false,
            error: `${fieldName} must be a valid email address`
          };
        }
        break;
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return {
            isValid: false,
            error: `${fieldName} must be a valid phone number`
          };
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return {
            isValid: false,
            error: `${fieldName} must be a list`
          };
        }
        break;
    }
  }

  // Min/Max validation (for numbers)
  if (rules.type === 'number' || typeof value === 'number') {
    const numValue = Number(value);
    if (rules.min !== undefined && numValue < rules.min) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.min}`
      };
    }
    if (rules.max !== undefined && numValue > rules.max) {
      return {
        isValid: false,
        error: `${fieldName} must be at most ${rules.max}`
      };
    }
  }

  // Length validation (for strings and arrays)
  if (typeof value === 'string' || Array.isArray(value)) {
    const length = value.length;
    if (rules.minLength !== undefined && length < rules.minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.minLength} characters long`
      };
    }
    if (rules.maxLength !== undefined && length > rules.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at most ${rules.maxLength} characters long`
      };
    }
  }

  // Pattern validation
  if (rules.pattern && typeof value === 'string') {
    if (!rules.pattern.test(value)) {
      return {
        isValid: false,
        error: `${fieldName} format is invalid`
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return {
        isValid: false,
        error: customError
      };
    }
  }

  return { isValid: true };
};

/**
 * Validates an entire form data object against validation rules
 */
export const validateForm = (data: Record<string, any>, rules: ValidationRules): ValidationResult => {
  const errors: Record<string, string> = {};
  let firstError: string | undefined;

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const result = validateField(data[fieldName], fieldRules, fieldName);
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
      if (!firstError) {
        firstError = result.error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError
  };
};

/**
 * Real-time validation for form fields
 */
export const useFieldValidation = () => {
  const validateSingleField = (value: any, rules: ValidationRule, fieldName: string) => {
    return validateField(value, rules, fieldName);
  };

  const validateMultipleFields = (data: Record<string, any>, rules: ValidationRules) => {
    return validateForm(data, rules);
  };

  return {
    validateField: validateSingleField,
    validateForm: validateMultipleFields
  };
};

/**
 * Specific validation rules for room forms
 */
export const roomValidationRules: ValidationRules = {
  roomNumber: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 10,
    pattern: /^[a-zA-Z0-9-]+$/,
    custom: (value: string) => {
      if (value && value.trim() !== value) {
        return 'Room number cannot have leading or trailing spaces';
      }
      return null;
    }
  },
  roomType: {
    required: true,
    type: 'string',
    custom: (value: string) => {
      const validTypes = ['single', 'double', 'triple', 'quad', 'suite', 'studio'];
      if (!validTypes.includes(value)) {
        return 'Room type must be one of: single, double, triple, quad, suite, or studio';
      }
      return null;
    }
  },
  capacity: {
    required: true,
    type: 'number',
    min: 1,
    max: 10,
    custom: (value: number) => {
      if (!Number.isInteger(value)) {
        return 'Capacity must be a whole number';
      }
      return null;
    }
  },
  monthlyRent: {
    required: true,
    type: 'number',
    min: 0.01,
    custom: (value: number) => {
      if (value <= 0) {
        return 'Monthly rent must be greater than 0';
      }
      if (value > 50000) {
        return 'Monthly rent seems unreasonably high (max 50,000)';
      }
      // Check for reasonable decimal places (max 2)
      if (value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
        return 'Monthly rent can have at most 2 decimal places';
      }
      return null;
    }
  },
  status: {
    required: true,
    type: 'string',
    custom: (value: string) => {
      const validStatuses = ['available', 'occupied', 'maintenance', 'reserved', 'unavailable'];
      if (!validStatuses.includes(value)) {
        return 'Status must be one of: available, occupied, maintenance, reserved, or unavailable';
      }
      return null;
    }
  },
  description: {
    required: false,
    type: 'string',
    maxLength: 500,
    custom: (value: string) => {
      if (value && value.trim().length < 10) {
        return 'Description should be at least 10 characters if provided';
      }
      return null;
    }
  },
  amenities: {
    required: false,
    type: 'array',
    custom: (value: string[]) => {
      if (value && value.length > 20) {
        return 'Cannot have more than 20 amenities';
      }
      if (value && value.some(amenity => amenity.length > 50)) {
        return 'Each amenity name must be less than 50 characters';
      }
      return null;
    }
  },
  floor: {
    required: false,
    type: 'number',
    min: 0,
    max: 100,
    custom: (value: number) => {
      if (value !== undefined && !Number.isInteger(value)) {
        return 'Floor must be a whole number';
      }
      return null;
    }
  },
  area: {
    required: false,
    type: 'number',
    min: 1,
    max: 1000,
    custom: (value: number) => {
      if (value !== undefined && value <= 0) {
        return 'Area must be a positive number';
      }
      if (value !== undefined && value > 1000) {
        return 'Area seems unreasonably large (max 1000 sq meters)';
      }
      return null;
    }
  },
  securityDeposit: {
    required: false,
    type: 'number',
    min: 0,
    custom: (value: number) => {
      if (value !== undefined && value < 0) {
        return 'Security deposit cannot be negative';
      }
      if (value !== undefined && value > 100000) {
        return 'Security deposit seems unreasonably high (max 100,000)';
      }
      // Check for reasonable decimal places (max 2)
      if (value !== undefined && value.toString().includes('.') && value.toString().split('.')[1].length > 2) {
        return 'Security deposit can have at most 2 decimal places';
      }
      return null;
    }
  }
};

/**
 * Formats field names to be more user-friendly
 */
export const formatFieldName = (fieldName: string): string => {
  const fieldNameMap: Record<string, string> = {
    roomNumber: 'Room Number',
    roomType: 'Room Type',
    monthlyRent: 'Monthly Rent',
    securityDeposit: 'Security Deposit',
    amenities: 'Amenities',
    description: 'Description',
    capacity: 'Capacity',
    status: 'Status',
    floor: 'Floor',
    area: 'Area'
  };
  
  return fieldNameMap[fieldName] || fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
};

/**
 * Gets user-friendly validation messages
 */
export const getValidationMessage = (fieldName: string, error: string): string => {
  const friendlyName = formatFieldName(fieldName);
  return error.replace(fieldName, friendlyName);
};

/**
 * Sanitizes input data to remove potential security issues
 */
export const sanitizeInput = (value: any): any => {
  if (typeof value === 'string') {
    // Remove potential XSS characters
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
  return value;
};

/**
 * Real-time form validation hook
 */
export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateSingleField = (fieldName: string, value: any) => {
    const result = validateField(value, rules[fieldName], fieldName);
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.error || ''
    }));
    return result.isValid;
  };

  const validateAllFields = (data: Record<string, any>) => {
    const result = validateForm(data, rules);
    setErrors(result.errors);
    return result;
  };

  const markFieldAsTouched = (fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const hasError = (fieldName: string) => {
    return touched[fieldName] && !!errors[fieldName];
  };

  const getError = (fieldName: string) => {
    return hasError(fieldName) ? errors[fieldName] : '';
  };

  return {
    errors,
    touched,
    validateField: validateSingleField,
    validateForm: validateAllFields,
    markFieldAsTouched,
    clearFieldError,
    hasError,
    getError,
    isValid: Object.keys(errors).length === 0
  };
};

// Import React for the hook
import React from 'react';