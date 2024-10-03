import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { RoleService } from '@smpm/role/role.service';
import { RoleType } from '@smpm/common/constants/enum';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { PageOptionUserDto } from './dto/page-option-user.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { AuditService } from '@smpm/audit/audit.service';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<UserEntity> {
    const findRole = await this.roleService.findOne(createUserDto.role_id);
    if (!findRole) throw new BadRequestException('Role not found.');

    if (findRole.type == RoleType.WILAYAH) {
      if (!createUserDto.region_id)
        throw new BadRequestException('region_id is required');
      createUserDto.vendor_id = null;
    }
    if (findRole.type == RoleType.VENDOR) {
      if (!createUserDto.vendor_id)
        throw new BadRequestException('vendor_id is required');
      createUserDto.region_id = null;
    }
    if (findRole.type == RoleType.PUSAT) {
      createUserDto.region_id = null;
      createUserDto.vendor_id = null;
    }

    delete createUserDto.password_confirmation;
    const data = await this.userService.create(createUserDto);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create User',
      MenuName: 'User',
      DataBefore: '',
      DataAfter: JSON.stringify(data),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.id,
    });

    return transformEntity(UserEntity, data);
  }

  @Get()
  async findAll(
    @Query() pageOptionUserDto: PageOptionUserDto,
  ): Promise<PageDto<UserEntity>> {
    const data = await this.userService.findAll(pageOptionUserDto);
    data.data = transformEntity(UserEntity, data.data);

    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<UserEntity> {
    const find = await this.userService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    return new UserEntity(find);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<UserEntity> {
    const find = await this.userService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const findRole = await this.roleService.findOne(updateUserDto.role_id);
    if (!findRole) throw new BadRequestException('Role not found.');

    if (findRole.type == RoleType.WILAYAH) {
      if (!updateUserDto.region_id)
        throw new BadRequestException('region_id is required');
      updateUserDto.vendor_id = null;
    }
    if (findRole.type == RoleType.VENDOR) {
      if (!updateUserDto.vendor_id)
        throw new BadRequestException('vendor_id is required');
      updateUserDto.region_id = null;
    }
    if (findRole.type == RoleType.PUSAT) {
      updateUserDto.region_id = null;
      updateUserDto.vendor_id = null;
    }

    const findExistEmail = await this.userService.findByEmail(
      updateUserDto.email,
    );
    if (updateUserDto.email && findExistEmail && findExistEmail.id != find.id)
      throw new BadRequestException('Email already exists.');

    const findExistNpp = await this.userService.findOneBy({
      npp: updateUserDto.npp,
    });
    if (updateUserDto.npp && findExistNpp && findExistNpp.id != find.id)
      throw new BadRequestException('NPP already exists.');

    delete updateUserDto.password_confirmation;
    const data = await this.userService.update(param.id, updateUserDto);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update User',
      MenuName: 'User',
      DataBefore: JSON.stringify(find),
      DataAfter: JSON.stringify(data),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.id,
    });


    return transformEntity(UserEntity, data);
  }

  @Delete(':id')
  async remove(@Param() param: ParamIdDto, @User() user: any, @Req() req: Request): Promise<null> {
    const find = await this.userService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found');

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete User',
      MenuName: 'User',
      DataBefore: JSON.stringify(find),
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

    return this.userService.remove(param.id);
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
