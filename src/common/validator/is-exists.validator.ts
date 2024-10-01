import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ async: false })
export class IsExist implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments) {
    const prisma = new PrismaClient() as any;
    const model = args.constraints[0];
    const field = args.constraints[1];
    const result = await prisma[model].findFirst({
      where: {
        [field]: value ? value : undefined,
        deleted_at: null,
      },
    });
    await prisma.$disconnect();
    return !!result;
  }

  defaultMessage(args: ValidationArguments) {
    return args.constraints[2] ?? `${args.constraints[0]} does not exist.`;
  }
}
