import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: false })
export class IsUnique implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const prisma = new PrismaClient() as any;
    const model = args.constraints[0];
    const field = args.constraints[1];
    if (!value) return true;
    const result = await prisma[model].findUnique({
      where: {
        [field]: value ? value : undefined,
      },
    });
    await prisma.$disconnect();
    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return args.constraints[2] ?? `${args.constraints[0]} is already exist.`;
  }
}
