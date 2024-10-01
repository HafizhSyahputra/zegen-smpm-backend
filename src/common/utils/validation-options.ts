import { UnprocessableEntityException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function formattingError(errors: ValidationError[]) {
  const formattedErrors: Record<string, string[] | any> = {};

  errors.forEach((error) => {
    const { property, constraints, children } = error;

    if (children && children.length > 0) {
      // Handle nested object errors recursively
      formattedErrors[property] = formattingError(children);
    } else {
      // Handle regular property errors
      formattedErrors[property] = Object.values(constraints);
    }
  });

  return formattedErrors;
}

export function formatValidationError(errors: ValidationError[]) {
  return new UnprocessableEntityException({
    message: 'Validation error',
    errors: formattingError(errors),
  });
}
