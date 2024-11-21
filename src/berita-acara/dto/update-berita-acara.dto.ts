// update-berita-acara.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBeritaAcaraDto } from './create-berita-acara.dto';

export class UpdateBeritaAcaraDto extends PartialType(CreateBeritaAcaraDto) {}