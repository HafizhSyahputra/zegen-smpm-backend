import { Exclude, Expose } from 'class-transformer';

export class UserSession implements UserSession {
  constructor(partial: Partial<UserSession>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: number;

  @Expose()
  user_id: number;

  @Expose()
  identifier: string;

  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;

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
