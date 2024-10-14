import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@smpm/prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async createMedia(createMediaDto: CreateMediaDto) {
    return await this.prisma.media.create({
      data: createMediaDto,
    });
  }

  async createManyMedia(createMediaDto: CreateMediaDto[]) {
    return await this.prisma.media.createMany({
      data: createMediaDto,
    });
  }

  async findMediaById(id: number) {  
    const media = await this.prisma.media.findUnique({ where: { id } });  
    if (!media) {  
        console.log(`Media with ID ${id} not found`); // Tambahkan log ini  
        throw new BadRequestException('Media not found');  
    }  
    return media;  
}

  insertMediaData = async (files: Express.Multer.File[]) => {
    const medias: { media_id: number }[] = [];
    await Promise.all(
      files.map(async (file) => {
        const media = await this.createMedia({
          filename: file.filename,
          ext: path.extname(file.filename),
          mime: file.mimetype,
          destination: file.path.replaceAll('\\', '/'),
          path: file.path.replaceAll('\\', '/').replace('uploads/', ''),
          size: file.size,
        });
        medias.push({
          media_id: media.id,
        });
      }),
    );
    return medias;
  };
}
