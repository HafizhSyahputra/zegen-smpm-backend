import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';

const transformEntity = <T, V>(
  cls: ClassConstructor<T>,
  plain: V[] | V,
  options?: ClassTransformOptions,
): any =>
  plainToInstance(cls, plain, { excludeExtraneousValues: true, ...options });

export { transformEntity };
