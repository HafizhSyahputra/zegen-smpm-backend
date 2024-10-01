import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsActive implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaClient) {}

  async validate(value: any, args: ValidationArguments) {
    const model = args.constraints[0];
    const field = args.constraints[1];
    const result = await (this.prisma as any)[model].findFirst({
      where: {
        [field]: value,
        is_active: true,
        deleted_at: null,
      },
    });
    return !!result;
  }

  defaultMessage(args: ValidationArguments) {
    return args.constraints[2] ?? `${args.constraints[0]} is not active.`;
  }
}
