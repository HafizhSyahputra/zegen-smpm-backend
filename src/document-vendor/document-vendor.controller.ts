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
import { AuditService } from '@smpm/audit/audit.service';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
import { User } from '@smpm/common/decorator/currentuser.decorator';
import { Request, Response } from 'express';
import { DocumentVendorService } from './document-vendor.service';
import { PageOptionDocVendorDto } from './dto/page-option.dto';
import { DocVendorEntity } from './entities/docVendor.entity';
import { UpdateDocVendorDto } from './dto/update-docVendor.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
import { CreateDocVendorDto } from './dto/create-docVendor.dto';

@UseGuards(AccessTokenGuard)
@Controller('document-vendor')
export class DocumentVendorController {
  constructor(
    private readonly docVendorService: DocumentVendorService,
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
    @Body() createDoVendorDto: CreateDocVendorDto,
    @Req() req: Request,
    @User() user: any,
  ) {
    const file1 = files.file1 ? files.file1[0] : undefined;
    const file2 = files.file2 ? files.file2[0] : undefined;

    if (!file1) {
      throw new BadRequestException('File1 is required.');
    }

    const createdDocument = await this.docVendorService.create(
      createDoVendorDto,
      file1,
      file2,
      user?.sub,
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Create Document Vendor',
      MenuName: 'Document Vendor',
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
    @Query() pageOptionDocVendorDto: PageOptionDocVendorDto,
  ): Promise<PageDto<DocVendorEntity>> {
    const data = await this.docVendorService.findAll(pageOptionDocVendorDto);
    data.data = data.data.map(
      (item) =>
        new DocVendorEntity({
          ...item,
        }),
    );
    return data;
  }

  @Get(':id')
  async findOne(@Param() param: ParamIdDto): Promise<DocVendorEntity> {
    const find = await this.docVendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');
    return new DocVendorEntity(find);
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
          destination: 'uploads/document-vendor/',  
          filename: (req, file, cb) => {  
            const originalName = file.originalname;  
            return cb(null, originalName);  
          },  
        }),  
      }  
    )  
  )  
  async update(
    @Param() param: ParamIdDto,
    @UploadedFiles()
    files: { file1?: Express.Multer.File[]; file2?: Express.Multer.File[] },
    @Body() updateDocVendorDto: UpdateDocVendorDto,
    @User() user: any,
    @Req() req: Request,
  ): Promise<DocVendorEntity> {
    const find = await this.docVendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    const oldData = await this.docVendorService.findOne(Number(param.id));

    if (files.file1 && files.file1.length > 0) {
      updateDocVendorDto.file1 = files.file1[0].path;
    }
    if (files.file2 && files.file2.length > 0) {
      updateDocVendorDto.file2 = files.file2[0].path;
    }

    const update = await this.docVendorService.update(
      param.id,
      updateDocVendorDto,
      user?.sub,
    );

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Update Document Vendor',
      MenuName: 'Document Vendor',
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
    const docVendor = await this.docVendorService.findOne(id);
    if (!docVendor) {
      throw new BadRequestException('Data not found.');
    }

    const filePath = docVendor[fileKey];
    if (!filePath) {
      throw new BadRequestException(`No file found for ${fileKey}.`);
    }

    await this.docVendorService.deleteFile(id, fileKey);

    await this.auditService.create({  
      Url: req.url,  
      ActionName: 'Delete File',  
      MenuName: 'Document Vendor',  
      DataBefore: JSON.stringify(docVendor),  
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
    const docVendor = await this.docVendorService.findOne(id);
    if (!docVendor) {
      throw new BadRequestException('Data not found.');
    }

    const filePath = docVendor[file];
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
    const find = await this.docVendorService.findOne(param.id);
    if (!find) throw new BadRequestException('Data not found.');

    await this.docVendorService.remove(param.id);

    await this.auditService.create({
      Url: req.url,
      ActionName: 'Delete Document Vendor',
      MenuName: 'Document Vendor',
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
