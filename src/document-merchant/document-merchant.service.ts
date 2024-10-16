import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { CreateDocMerchantDto } from './dto/create-docMerchant.dto';
import { DocumentMerchant, Prisma } from '@prisma/client';
import { PageOptionDocMerchantDto } from './dto/page-option.dto';
import { PageDto } from '@smpm/common/decorator/page.dto';
import { ColumntDocMerchant } from '@smpm/common/constants/enum';
import { PageMetaDto } from '@smpm/common/decorator/page-meta.dto';
import { UpdateDocMerchantDto } from './dto/update-docMerchant.dto';
import { DocMerchantEntity } from './entities/docMerchant.entity';
import { v4 as uuidv4 } from 'uuid';  
import { extname } from 'path';
import * as fs from 'fs';  

@Injectable()
export class DocumentMerchantService {
    constructor(private readonly prisma: PrismaService) {}

    async create(  
      createDocMerchantDto: CreateDocMerchantDto,  
      file1?: Express.Multer.File,  
      file2?: Express.Multer.File,  
    ): Promise<DocMerchantEntity> {  
      const { merchant_id, region_id, location, created_by } = createDocMerchantDto;  
  
      const file1Name = file1 ? this.generateUniqueFileName(file1.originalname) : null;  
      const file2Name = file2 ? this.generateUniqueFileName(file2.originalname) : null;  
  
       const createdDocument = await this.prisma.documentMerchant.create({  
        data: {  
          merchant_id,  
          region_id,
          location,  
          file1: file1 ? `uploads/document-merchant/${file1Name}` : null,  
          file2: file2 ? `uploads/document-merchant/${file2Name}` : null,  
          created_by,  
        },  
      });  
  
      if (file1) {  
        const file1Name = `uploads/document-merchant/${file1.filename}`;  
        await fs.promises.writeFile(file1Name, file1.buffer);  
      }  
      if (file2) {  
        const file2Name = `uploads/document-merchant/${file2.filename}`;  
        await fs.promises.writeFile(file2Name, file2.buffer);  
      }  
  
      return new DocMerchantEntity(createdDocument);  
    }  
  
    private generateUniqueFileName(originalName: string): string {  
      const extension = extname(originalName);  
      const fileName = `${uuidv4()}${extension}`;  
      return fileName;  
    }  
  

 async findAll(pageOptionDocMerchantDto: PageOptionDocMerchantDto): Promise<PageDto<DocumentMerchant>> {
    const { skip, take, order, order_by, search, search_by } = pageOptionDocMerchantDto;

    const filter: Prisma.DocumentMerchantWhereInput = {
      deleted_at: null, 
    };
    const orderBy: Prisma.DocumentMerchantOrderByWithRelationInput = {};

    if (search && search_by) {
      filter.OR = search_by.map((field: ColumntDocMerchant) => ({
        [field]: { contains: search, mode: 'insensitive' },
      }));
    }

    if (order_by) {
      orderBy[order_by] = order;
    } else {
      orderBy[ColumntDocMerchant.id] = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.documentMerchant.findMany({
        where: filter,
        skip,
        take,
        orderBy,
        include: {
          merchant: true,
          region: true,
        },
      }),
      this.prisma.documentMerchant.count({ where: filter }),
    ]);

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto: pageOptionDocMerchantDto,
    });

    return new PageDto(items, pageMetaDto);
  }

  async findOne(id: number): Promise<DocumentMerchant | null> {
    return this.prisma.documentMerchant.findUnique({
      where: { id, deleted_at: null },
      include: {
        merchant: true,
        region: true,
      },
    });
  }

  async remove(id: number): Promise<DocumentMerchant> {
    return this.prisma.documentMerchant.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async update(id: number, updateDocMerchantDto: UpdateDocMerchantDto): Promise<DocMerchantEntity> {  
    const updatedDocument = await this.prisma.documentMerchant.update({  
      where: { id },  
      data: {  
        ...updateDocMerchantDto,  
        updated_at: new Date(),    
      },  
    });  
    return new DocMerchantEntity(updatedDocument);  
}

async deleteFile(id: number, fileKey: 'file1' | 'file2'): Promise<void> {
  const docMerchant = await this.findOne(id);
  if (!docMerchant) {
    throw new BadRequestException('Data not found.');
  }

  const filePath = docMerchant[fileKey];
  if (!filePath) {
    throw new BadRequestException(`No file found for ${fileKey}.`);
  }

  try {
    await this.prisma.documentMerchant.update({
      where: { id },
      data: {
        [fileKey]: null,
      },
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new BadRequestException('Error deleting file.');
  }
}
  
async updateFilesPaths(id: number, filePaths: string[]): Promise<DocMerchantEntity> {  
  const docMerchant = await this.prisma.documentMerchant.findUnique({  
    where: { id },  
  });  
  if (!docMerchant) {  
    throw new BadRequestException('Data not found.');  
  }  

  const updatedDocument = await this.prisma.documentMerchant.update({  
    where: { id },  
    data: {  
      file1: filePaths[0] || null,  
      file2: filePaths[1] || null,  
      updated_at: new Date(),  
    },  
  });  

  return new DocMerchantEntity(updatedDocument);  
}  
}
function uuidv4() {
  throw new Error('Function not implemented.');
}

