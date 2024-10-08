import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { DocumentMerchantService } from './document-merchant.service';
import { AuditService } from '@smpm/audit/audit.service';
import { PageOptionDocMerchantDto } from './dto/page-option.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { DocMerchantEntity } from './entities/docMerchant.entity';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { CreateDocMerchantDto } from './dto/create-docMerchant.dto';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request } from 'express';
import { UpdateDocMerchantDto } from './dto/update-docMerchant.dto';

@Controller('document-merchant')
export class DocumentMerchantController {
    constructor(
        private readonly docmerchantService: DocumentMerchantService,
        private readonly auditService: AuditService,
      ) {}

      
  @Get()
  async findAll(
    @Query() pageOptionDocMerchantDto: PageOptionDocMerchantDto,
  ): Promise<PageDto<DocMerchantEntity>> {
    const data = await this.docmerchantService.findAll(pageOptionDocMerchantDto);
    data.data = data.data.map(
      (item) =>
        new DocMerchantEntity({
          ...item,
        }),
    );
    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<DocMerchantEntity> {
    const find = await this.docmerchantService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');
    return new DocMerchantEntity(find);
  }

  @Patch(':id')
  async update(
    @Param() param: ParamIdDto,
    @Body() updateDocMerchantDto: UpdateDocMerchantDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<DocMerchantEntity> {
    const find = await this.docmerchantService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.docmerchantService.findOne(Number(param.id));
    const update = new DocMerchantEntity(
      await this.docmerchantService.update(param.id, updateDocMerchantDto),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update Document Merchant',
      MenuName: 'Document Merchant',
      DataBefore: JSON.stringify(oldData),
      DataAfter: JSON.stringify(update),
      UserName: user.name,
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user.sub,
      updated_by: user.sub,
    });

    return update;
  }

  
  @Delete(':id')
  async remove(
    @Param() param: ParamIdDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<void> {
    const find = await this.docmerchantService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    await this.docmerchantService.remove(param.id);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Document Merchant',
      MenuName: 'Document Merchant',
      DataBefore: JSON.stringify(find),
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
