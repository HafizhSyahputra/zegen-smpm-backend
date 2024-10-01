import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidDateString', async: false })
export class IsValidDateString implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (value === null || value === undefined || value == '') {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    // Check if the value is a valid date string
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid date string.`;
  }
}
