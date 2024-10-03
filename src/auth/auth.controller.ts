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
import { AuditService } from '@smpm/audit/audit.service';
import { User } from '@smpm/common/decorator/currentuser.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService
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

    const tokens = await this.authService.getTokens(user.id, user.email, user.name);
  
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

      // Audit log
      await this.auditService.create({  
        Url: req.url,  
        ActionName: 'Sign in',  
        MenuName: 'Autentikasi',  
        DataBefore: '',  
        DataAfter: JSON.stringify({id: user.id, name: user.name }),  
        UserName: user.name, 
        IpAddress: req.ip,  
        ActivityDate: new Date(),  
        Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),  
        OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),  
        AppSource: 'Desktop',  
        created_by: user.id,   
        updated_by: user.id,  
      });  
  

    return new SigninEntity(tokens);
  }

  @UseGuards(AccessTokenGuard)
  @Get('sign-out')
  async signout(@Req() req: Request,   @User() user: any): Promise<null> {
    await this.authService.modifyUserSession({
      user_id: req.user['sub'],
      identifier: req.headers['user-agent'],
      access_token: null,
      refresh_token: null,
    });

    await this.auditService.create({  
      Url: req.url,  
      ActionName: 'Sign out',  
      MenuName: 'Autentikasi',  
      DataBefore: JSON.stringify({id: user.sub, name: user.name }),  
      DataAfter: '',  
      UserName: user.name, 
      IpAddress: req.ip,  
      ActivityDate: new Date(),  
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),  
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),  
      AppSource: 'Desktop',  
      created_by: user.sub,   
      updated_by: user.id,  
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

    const tokens = await this.authService.getTokens(find.id, find.email, find.name);

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

  private getBrowserFromUserAgent(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private getOSFromUserAgent(userAgent: string, request: Request): string {
    const testOS = request.headers['x-test-os'];
    if (/PostmanRuntime/i.test(userAgent))
      return 'Postman (Testing Environment)';
    if (testOS) return testOS as string;
    if (userAgent.includes('Win')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
  }
}
