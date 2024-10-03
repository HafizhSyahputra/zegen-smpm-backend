
// src/look-up/dto/update-look-up.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateLookUpDto } from './create-lookup.dto';
import { IsInt } from 'class-validator';

export class UpdateLookUpDto extends PartialType(CreateLookUpDto) {
  @IsInt()
  id: number;
}
