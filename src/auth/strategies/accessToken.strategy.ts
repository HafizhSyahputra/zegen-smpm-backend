import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { UserEntity } from '@smpm/user/entities/user.entity';
import { UserService } from '@smpm/user/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtConfig } from 'src/common/interfaces/config.interface';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<IJwtConfig>('jwt').secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = transformEntity(
      UserEntity,
      await this.userService.findOne(Number(payload.sub)),
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      ...user,
      ...payload,
    };
  }
}
