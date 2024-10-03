import { Module } from '@nestjs/common';
import { LookUpService } from './lookup.service';
import { LookUpController } from './lookup.controller';
import { PrismaService } from '@smpm/prisma/prisma.service';

@Module({
  controllers: [LookUpController],
  providers: [LookUpService, PrismaService],
})
export class LookUpModule {}