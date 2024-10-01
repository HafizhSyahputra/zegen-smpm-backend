import { IsArray } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @IsArray()
  data: T[any];

  readonly meta: PageMetaDto;

  constructor(data: T[any], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
