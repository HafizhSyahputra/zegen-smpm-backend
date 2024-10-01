import { PartialType } from '@nestjs/mapped-types';
import { CreateElectronicDataCaptureDto } from './create-electronic-data-capture.dto';

export class UpdateElectronicDataCaptureDto extends PartialType(CreateElectronicDataCaptureDto) {}
