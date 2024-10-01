import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { RefreshTokenGuard } from '@smpm/common/guards/refresh-token.guard';
import { UserService } from '@smpm/user/user.service';
import { compare } from 'bcrypt';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { SigninEntity } from './entities/signin.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-in')
  async signin(
    @Req() req: Request,
    @Body() data: AuthDto,
  ): Promise<SigninEntity> {
    const user = await this.userService.findByEmail(data.email);
    if (!user) throw new BadRequestException('Incorrect email or password');

    const passwordMatches = await compare(data.password, user.password);
    if (!passwordMatches)
      throw new BadRequestException('Incorrect email or password.');

    const tokens = await this.authService.getTokens(user.id, user.email);

    const [hashAccessToken, hashRefreshToken] = await Promise.all([
      this.authService.hashData(tokens.access_token),
      this.authService.hashData(tokens.refresh_token),
    ]);

    await this.authService.modifyUserSession({
      user_id: user.id,
      identifier: req.headers['user-agent'],
      access_token: hashAccessToken,
      refresh_token: hashRefreshToken,
    });

    return new SigninEntity(tokens);
  }

  @UseGuards(AccessTokenGuard)
  @Get('sign-out')
  async signout(@Req() req: Request): Promise<null> {
    await this.authService.modifyUserSession({
      user_id: req.user['sub'],
      identifier: req.headers['user-agent'],
      access_token: null,
      refresh_token: null,
    });

    return null;
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const userAgent = req.headers['user-agent'];
    const refreshToken = req.user['refreshToken'];

    const [find, session] = await Promise.all([
      this.userService.findOne(userId),
      this.userService.findOneUserSessionBy({
        user_id: userId,
        identifier: userAgent,
      }),
    ]);
    if (!find || !session.refresh_token)
      throw new BadRequestException('Access denied');

    const refreshTokenMatches = await compare(
      refreshToken,
      session.refresh_token,
    );
    if (!refreshTokenMatches) throw new BadRequestException('Access denied');

    const tokens = await this.authService.getTokens(find.id, find.email);

    const [hashAccessToken, hashRefreshToken] = await Promise.all([
      this.authService.hashData(tokens.access_token),
      this.authService.hashData(tokens.refresh_token),
    ]);

    await this.authService.modifyUserSession({
      user_id: find.id,
      identifier: userAgent,
      access_token: hashAccessToken,
      refresh_token: hashRefreshToken,
    });

    return tokens;
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async profile(@Req() req: Request) {
    return await this.userService.findOne(req.user['sub']);
  }
}
