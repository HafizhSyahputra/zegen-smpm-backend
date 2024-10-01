import { PageMetaDtoParameters } from '../interfaces/pagination.interface';

export class PageMetaDto {
  readonly page: number;
  readonly take: number;
  readonly item_count: number;
  readonly page_count: number;
  readonly has_previous_page: boolean;
  readonly has_next_page: boolean;

  constructor({ pageOptionsDto, itemCount }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.item_count = itemCount;
    this.page_count = Math.ceil(this.item_count / this.take);
    this.has_previous_page = this.page > 1;
    this.has_next_page = this.page < this.page_count;
  }
}
