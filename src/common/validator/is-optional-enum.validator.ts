import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsOptionalEnum(
  enumType: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isOptionalEnum',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Check if the value is an empty string
          if (value === '') {
            return true; // Value is valid if it's empty
          }

          // Perform the validation against the enum
          return enumType.hasOwnProperty(value);
        },
        defaultMessage(args: ValidationArguments) {
          const enumValues = Object.keys(enumType).join(', ');
          return `Invalid value, must be one of: ${enumValues}`;
        },
      },
    });
  };
}
