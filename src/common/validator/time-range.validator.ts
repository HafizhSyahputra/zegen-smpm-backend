import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'timeRange', async: false })
export class IsTimeRange implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    // Regular expression to match the format "16:00-18:00"
    const pattern =
      /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]-(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

    return typeof value === 'string' && pattern.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be in the format "16:00-18:00"`;
  }
}
