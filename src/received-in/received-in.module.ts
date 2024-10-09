import { Module } from '@nestjs/common';
import { ReceivedInService } from './received-in.service';
import { ReceivedInController } from './received-in.controller';

@Module({
  providers: [ReceivedInService],
  controllers: [ReceivedInController]
})
export class ReceivedInModule {}
