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

@Injectable()
export class DocumentMerchantService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createDocMerchantDto: CreateDocMerchantDto): Promise<DocumentMerchant> {
        return this.prisma.documentMerchant.create({
          data: createDocMerchantDto,
        });
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
