import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserSession } from '@prisma/client';
import { IJwtConfig } from '@smpm/common/interfaces/config.interface';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { hash } from 'bcrypt';
import { UserSessionDto } from './dto/user-session.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  hashData(data: string): Promise<string> {
    return hash(data, 12);
  }

  async getTokens(user_id: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user_id,
          email,
        },
        {
          secret: this.configService.get<IJwtConfig>('jwt').secret,
          expiresIn: this.configService.get<IJwtConfig>('jwt').ttl,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user_id,
          email,
        },
        {
          secret: this.configService.get<IJwtConfig>('jwt').refresh_secret,
          expiresIn: this.configService.get<IJwtConfig>('jwt').refresh_ttl,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  modifyUserSession(userSessionDto: UserSessionDto): Promise<UserSession> {
    return this.prismaService.userSession.upsert({
      where: {
        user_id_identifier: {
          user_id: userSessionDto.user_id,
          identifier: userSessionDto.identifier,
        },
      },
      create: {
        ...userSessionDto,
      },
      update: {
        ...userSessionDto,
      },
    });
  }
}
