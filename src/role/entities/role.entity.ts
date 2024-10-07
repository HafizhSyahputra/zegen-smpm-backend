import { Role } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class RoleEntity implements Role {
  constructor(partial: Partial<RoleEntity>) {
    Object.assign(this, partial);
  }
  isActive: boolean;

  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  code: string;

  @Expose()
  type: string;

  @Expose()
  description: string;

  @Exclude()
  created_by: number;
  @Exclude()
  updated_by: number;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  deleted_at: Date;
}