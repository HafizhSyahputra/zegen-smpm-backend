import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  Req,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { Request, Response } from 'express';
import { PageOptionsDto } from '@smpm/common/decorator/page-options.dto';
import { GetMerchantQuery } from './dto/get-merchant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaxFileSize } from '@smpm/utils/FileValidator';
import { defaultConfig } from '@smpm/utils/FileConfig';
import { AuditService } from '@smpm/audit/audit.service';
import { User } from '@smpm/common/decorator/currentuser.decorator';

@Controller('merchant')
export class MerchantController {
  constructor(
    private readonly merchantService: MerchantService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  async create(
    @Body() createMerchantDto: CreateMerchantDto,
    @User() user: any,
    @Req() req: Request,
  ) {
    const create = await this.merchantService.create(createMerchantDto);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create Merchant',
      MenuName: 'Merchant',
      DataBefore: '',
      DataAfter: JSON.stringify(create),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.id,
    });

    return {
      status: 'Ok!',
      message: 'Success Create Merchant',
      ...create,
    };
  }

  @UseInterceptors(FileInterceptor('file', { storage: defaultConfig }))
  @Post('/create-bulk-excel')
  async createBulkExcel(
    @Res() response: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSize({
            maxSize: 10,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.merchantService.createBulk(file.filename);
  }

  @Get()
  async findAll(@Query() pageOptionsDto: PageOptionsDto & GetMerchantQuery) {
    return await this.merchantService.findAll(pageOptionsDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.merchantService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @User() user: any,
    @Req() req: Request,
  ) {
    const oldData = await this.merchantService.findOne(Number(id));
    const update = this.merchantService.update(+id, updateMerchantDto);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update Merchant',
      MenuName: 'Merchant',
      DataBefore: JSON.stringify(oldData),
      DataAfter: JSON.stringify(update),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.id,
    });

    return {
      status: 'Ok!',
      message: 'Success Update Merchant',
      ...update,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User() user: any, @Req() req: Request) {
    const oldData = await this.merchantService.findOne(Number(id));

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Merchant',
      MenuName: 'Merchant',
      DataBefore: JSON.stringify(oldData),
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

    return this.merchantService.remove(+id);
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
