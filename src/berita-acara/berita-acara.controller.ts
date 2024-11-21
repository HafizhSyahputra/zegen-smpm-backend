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
    UseGuards,
    UseInterceptors,
    UploadedFile,
  } from '@nestjs/common';
  import { BeritaAcaraService } from './berita-acara.service';
  import { PageDto } from '@smpm/common/decorator/page.dto';
  import { transformEntity } from '@smpm/common/transformer/entity.transformer';
  import { ParamIdDto } from '@smpm/common/decorator/param-id.dto';
  import { AccessTokenGuard } from '@smpm/common/guards/access-token.guard';
  import { User } from '@smpm/common/decorator/currentuser.decorator';
  import { Request } from 'express';
  import { AuditService } from '@smpm/audit/audit.service';
  import { FileUploadInterceptor } from '@smpm/common/interceptors/file-upload.interceptor';
import { CreateBeritaAcaraDto } from './dto/create-berita-acara.dto';
import { BeritaAcaraEntity } from './entities/berita-acara.entity';
import { PageOptionBeritaAcaraDto } from './dto/page-options-berita-acara.dto';
  
  @UseGuards(AccessTokenGuard)
  @Controller('berita-acara')
  export class BeritaAcaraController {
    constructor(
      private readonly beritaAcaraService: BeritaAcaraService,
      private readonly auditService: AuditService,
    ) {}
  
    @Post()
    async create(
      @Body() createBeritaAcaraDto: CreateBeritaAcaraDto,
      @User() user: any,
      @Req() req: Request,
    ): Promise<BeritaAcaraEntity> {
      const create = new BeritaAcaraEntity(
        await this.beritaAcaraService.create(createBeritaAcaraDto),
      );
  
      await this.auditService.create({
        Url: req.url,
        ActionName: 'Create Berita Acara',
        MenuName: 'Berita Acara',
        DataBefore: '',
        DataAfter: JSON.stringify(create),
        UserName: user.name,
        IpAddress: req.ip,
        ActivityDate: new Date(),
        Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
        OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
        AppSource: 'Desktop',
        created_by: user.sub,
        updated_by: user.sub,
      });
  
      return create;
    }
  
    @Get()
    async findAll(
      @Query() pageOptionBeritaAcaraDto: PageOptionBeritaAcaraDto,
    ): Promise<PageDto<BeritaAcaraEntity>> {
      const data = await this.beritaAcaraService.findAll(pageOptionBeritaAcaraDto);
      data.data = transformEntity(BeritaAcaraEntity, data.data);
      return data;
    }
  
    @Get(':id')
    async findOne(@Param() param: ParamIdDto): Promise<BeritaAcaraEntity> {
      const find = await this.beritaAcaraService.findOne(param.id);
      if (!find) throw new BadRequestException('Data not found.');
      return new BeritaAcaraEntity(find);
    }
  
    @Post(':id/submit')
    @UseInterceptors(
      FileUploadInterceptor({
        name: 'file',
        dirPath: 'uploads/berita-acara',
        prefixName: 'BA', 
        maxSize: 10,
        maxCount: 1,
        ext: ['pdf']
      })
    )
    async submitFile(
      @Param('id') id: number,
      @UploadedFile() file: Express.Multer.File,
      @User() user: any,
      @Req() req: Request,
    ) {
      const oldData = await this.beritaAcaraService.findOne(id);
      const submit = await this.beritaAcaraService.submitFile(id, file);
  
      await this.auditService.create({
        Url: req.url,
        ActionName: 'Submit Berita Acara File',
        MenuName: 'Berita Acara',
        DataBefore: JSON.stringify(oldData),
        DataAfter: JSON.stringify(submit),
        UserName: user.name,
        IpAddress: req.ip,
        ActivityDate: new Date(),
        Browser: this.getBrowserFromUserAgent(req.headers['user-agent'] || ''),
        OS: this.getOSFromUserAgent(req.headers['user-agent'] || '', req),
        AppSource: 'Desktop',
        created_by: user.sub,
        updated_by: user.sub,
      });
  
      return new BeritaAcaraEntity(submit);
    }
  
    @Patch(':id/note')
    async updateNote(
      @Param('id') id: number,
      @Body('note') note: string,
      @User() user: any,
      @Req() req: Request,
    ) {
      const oldData = await this.beritaAcaraService.findOne(id);
      const update = await this.beritaAcaraService.updateNote(id, note);
  
      await this.auditService.create({
        Url: req.url,
        ActionName: 'Update Note Berita Acara',
        MenuName: 'Berita Acara',
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
  
      return new BeritaAcaraEntity(update);
    }
  
    @Patch(':id/update-file')
    @UseInterceptors(
      FileUploadInterceptor({
        name: 'file',
        dirPath: 'uploads/berita-acara',
        prefixName: 'BA',
        maxSize: 10,
        maxCount: 1,
        ext: ['pdf']
      })
    )
    async updateFile(
      @Param('id') id: number,
      @UploadedFile() file: Express.Multer.File,
      @User() user: any,
      @Req() req: Request,
    ) {
      const oldData = await this.beritaAcaraService.findOne(id);
      const update = await this.beritaAcaraService.updateFile(id, file);
  
      await this.auditService.create({
        Url: req.url,
        ActionName: 'Update File Berita Acara',
        MenuName: 'Berita Acara',
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
  
      return new BeritaAcaraEntity(update);
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
  