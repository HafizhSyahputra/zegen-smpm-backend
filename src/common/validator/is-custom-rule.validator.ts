import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsCustomRule', async: false })
class CustomValidationConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const rule = args.constraints[0];
    return rule(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} ${args.constraints[1]}`;
  }
}

export function IsCustomRule(
  // eslint-disable-next-line @typescript-eslint/ban-types
  rule: Function,
  message: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [rule, message],
      validator: CustomValidationConstraint,
    });
  };
}
