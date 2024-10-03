// role.controller.ts
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { transformEntity } from '@smpm/common/transformer/entity.transformer';
import { CreateRoleDto } from './dto/create-role.dto';
import { PageOptionRoleDto } from './dto/page-option-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { RoleService } from './role.service';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { Prisma } from '@prisma/client';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { AuditService } from '@smpm/audit/audit.service';
import { Request } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<RoleEntity> {
    try {
      const role = await this.roleService.create(createRoleDto);

      await this.auditService.create({
        Url: req.url,
        ActionName: 'Create Role',
        MenuName: 'Role',
        DataBefore: '',
        DataAfter: JSON.stringify(role),
        UserName: user.name,
        IpAddress: req.ip,
        ActivityDate: new Date(),
        Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
        OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
        AppSource: 'Desktop',
        created_by: user.sub,
        updated_by: user.sub,
      });

      
      return new RoleEntity(role);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Role with this name or code already exists',
          );
        }
      }
      throw new InternalServerErrorException('Failed to create role');
    }
  }

  @Get()
  async findAll(
    @Query() pageOptionRoleDto: PageOptionRoleDto,
  ): Promise<PageDto<RoleEntity>> {
    const data = await this.roleService.findAll(pageOptionRoleDto);
    data.data = transformEntity(RoleEntity, data.data);

    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<RoleEntity> {
    const find = await this.roleService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found');

    return new RoleEntity(find);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateRoleDto: UpdateRoleDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<RoleEntity> {
    const oldData = await this.roleService.findOne(Number(param.id));
    
    const find = await this.roleService.findOne(+param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const findExistName = await this.roleService.findOneBy({
      name: updateRoleDto.name,
    });
    if (findExistName && findExistName.id != find.id)
      throw new BadRequestException('Name already exist.');

    const findExistCode = await this.roleService.findOneBy({
      code: updateRoleDto.code,
    });
    if (findExistCode && findExistCode.id != find.id)
      throw new BadRequestException('Code already exist.');

    const data = await this.roleService.update(+param.id, updateRoleDto);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update Role',
      MenuName: 'Role',
      DataBefore: JSON.stringify(oldData),
      DataAfter: JSON.stringify(data),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });


    return new RoleEntity(data);
  }

  @Delete(':id')
  async remove(@Param() param: ParamIdDto, @User() user: any,
  @Req() req: Request,): Promise<null> {
    const find = await this.roleService.findOne(+param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.roleService.findOne(Number(param.id));

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Role',
      MenuName: 'Role',
      DataBefore: JSON.stringify(oldData),
      DataAfter: '',
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });

    return await this.roleService.remove(+param.id);
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
