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
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentMerchantService } from './document-merchant.service';
import { AuditService } from '@smpm/audit/audit.service';
import { PageOptionDocMerchantDto } from './dto/page-option.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { DocMerchantEntity } from './entities/docMerchant.entity';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { Request } from 'express';
import { UpdateDocMerchantDto } from './dto/update-docMerchant.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express/multer';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { CreateDocMerchantDto } from './dto/create-docMerchant.dto';

@UseGuards(AccessTokenGuard)
@Controller('document-merchant')
export class DocumentMerchantController {
  constructor(
    private readonly docmerchantService: DocumentMerchantService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file1', maxCount: 1 },
      { name: 'file2', maxCount: 1 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: { file1?: Express.Multer.File[]; file2?: Express.Multer.File[] },
    @Body() createDocMerchantDto: CreateDocMerchantDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<DocMerchantEntity> {
    const file1 = files.file1 ? files.file1[0] : undefined;
    const file2 = files.file2 ? files.file2[0] : undefined;

    const createdDocument = await this.docmerchantService.create(
      createDocMerchantDto,
      file1,
      file2,
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create Document Merchant',
      MenuName: 'Document Merchant',
      DataBefore: '',
      DataAfter: JSON.stringify(createdDocument),
      UserName: user?.name || 'Unknown',
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user?.sub || null,
      updated_by: user?.sub || null,
    });

    return createdDocument;
  }

  @Get()
  async findAll(
    @Query() pageOptionDocMerchantDto: PageOptionDocMerchantDto,
  ): Promise<PageDto<DocMerchantEntity>> {
    const data = await this.docmerchantService.findAll(
      pageOptionDocMerchantDto,
    );
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file1', maxCount: 1 },
        { name: 'file2', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: 'uploads/document-merchant/',
          filename: (req, file, cb) => {
            const originalName = file.originalname;
            return cb(null, originalName);
          },
        }),
      },
    ),
  )
  async update(
    @Param() param: ParamIdDto,
    @UploadedFiles()
    files: { file1?: Express.Multer.File[]; file2?: Express.Multer.File[] },
    @Body() updateDocMerchantDto: UpdateDocMerchantDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<DocMerchantEntity> {
    const find = await this.docmerchantService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.docmerchantService.findOne(Number(param.id));

    if (files.file1 && files.file1.length > 0) {
      updateDocMerchantDto.file1 = files.file1[0].path;
    }
    if (files.file2 && files.file2.length > 0) {
      updateDocMerchantDto.file2 = files.file2[0].path;
    }

    const update = new DocMerchantEntity(
      await this.docmerchantService.update(param.id, updateDocMerchantDto),
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update Document Merchant',
      MenuName: 'Document Merchant',
      DataBefore: JSON.stringify(oldData),
      DataAfter: JSON.stringify(update),
      UserName: user?.name || 'Unknown',
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user?.sub || null,
      updated_by: user?.sub || null,
    });

    return update;
  }

  @Delete(':id/file/:fileKey')
  async deleteFile(
    @Param('id') id: number,
    @Param('fileKey') fileKey: 'file1' | 'file2',
    @User() user: any,
    @Req() req: Request,
  ) {
    const docMerchant = await this.docmerchantService.findOne(id);
    if (!docMerchant) {
      throw new BadRequestException('Data not found.');
    }

    const filePath = docMerchant[fileKey];
    if (!filePath) {
      throw new BadRequestException(`No file found for ${fileKey}.`);
    }

    await this.docmerchantService.deleteFile(id, fileKey);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete File',
      MenuName: 'Document Merchant',
      DataBefore: JSON.stringify(docMerchant),
      DataAfter: '',
      UserName: user?.name || 'Unknown',
      IpAddress: req.ip,
      ActivityDate: new Date(),
      Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
      OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
      AppSource: 'Desktop',
      created_by: user?.sub || null,
      updated_by: user?.sub || null,
    });

    return { message: 'File deleted successfully.' };
  }

  @Get(':id/download/:file')
  async getFile(
    @Param('id') id: number,
    @Param('file') file: 'file1' | 'file2',
    @Res() res: Response,
  ) {
    const docMerchant = await this.docmerchantService.findOne(id);
    if (!docMerchant) {
      throw new BadRequestException('Data not found.');
    }

    const filePath = docMerchant[file];
    if (!filePath) {
      throw new BadRequestException(`No file found for ${file}.`);
    }

    try {
      const fileName = this.getFileName(filePath);
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          throw new BadRequestException('Error downloading file.');
        }
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new BadRequestException('Error downloading file.');
    }
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

  private getFileName(filePath: string): string {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
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
