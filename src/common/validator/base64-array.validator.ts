import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBase64Array', async: false })
export class IsBase64ArrayConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!Array.isArray(value)) {
      return false;
    }

    // Check if all items in the array are valid base64 strings
    return value.every((item) => {
      // Use a regex to validate the base64 format
      const base64Regex = /^data:([a-zA-Z0-9+/]+);base64,/;
      return typeof item === 'string' && base64Regex.test(item);
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be an array of valid base64 strings`;
  }
}

export function IsBase64Array(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBase64ArrayConstraint,
    });
  };
}
