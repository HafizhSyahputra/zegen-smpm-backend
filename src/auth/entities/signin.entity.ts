import { Expose } from 'class-transformer';

export class SigninEntity {
  constructor(partial: Partial<SigninEntity>) {
    Object.assign(this, partial);
  }
  @Expose()
  access_token: string;
  @Expose()
  refresh_token: string;
}
