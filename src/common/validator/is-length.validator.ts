import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isLength', async: false })
export class LengthConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const expectedLength = args.constraints[0];
    if (value) {
      return value.toString().length === expectedLength;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const expectedLength = args.constraints[0];
    return `The length of the value must be exactly ${expectedLength} characters.`;
  }
}

export function IsLength(
  expectedLength: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [expectedLength],
      validator: LengthConstraint,
      async: false,
    });
  };
}
