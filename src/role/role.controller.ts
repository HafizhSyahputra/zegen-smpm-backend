// role.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

@UseGuards(AccessTokenGuard) // Pastikan semua endpoint dijaga keamanan
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    return new RoleEntity(await this.roleService.create(createRoleDto));
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
  ): Promise<RoleEntity> {
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

    return new RoleEntity(data);
  }

  @Delete(':id')
  async remove(@Param() param: ParamIdDto): Promise<null> {
    const find = await this.roleService.findOne(+param.id);
    if (!find) throw new BadRequestException('Data not found.');

    return await this.roleService.remove(+param.id);
  }
}
