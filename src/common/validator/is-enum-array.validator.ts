import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsEnumArray(
  enumType: any,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEnumArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) {
            return false;
          }

          const enumValues = Object.values(enumType);

          for (const item of value) {
            if (!enumValues.includes(item)) {
              return false;
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${
            args.property
          } must be an array of valid enum values: ${Object.values(
            enumType,
          ).join(', ')}`;
        },
      },
    });
  };
}
