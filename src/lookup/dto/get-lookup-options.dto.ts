import { IntersectionType } from '@nestjs/mapped-types';
import { PageOptionsDto } from '../../common/decorator/page-options.dto';
import { GetLookUpQueryDto } from './get-lookup.dto';

export class GetLookUpOptionsDto extends IntersectionType(PageOptionsDto, GetLookUpQueryDto) {}