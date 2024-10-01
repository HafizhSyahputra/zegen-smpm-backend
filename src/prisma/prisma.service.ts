import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { transformDatesToLocal } from '@smpm/common/transformer/date-to-local.transformer';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });

    this.$use(async (params, next) => {
      if (params.action.includes('find') && params.model) {
        // Apply the UTC to local date transformation to all DateTime fields in the query result
        const result = await next(params);
        if (Array.isArray(result)) {
          return transformDatesToLocal(result);
        } else if (result) {
          return transformDatesToLocal([result])[0];
        }
      } else {
        return next(params);
      }
    });

    this.$use(async (params, next) => {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Change to findFirst - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'findFirst';
        // Add 'deleted_at' filter
        // ID filter maintained
        params.args.where['deleted_at'] = null;
      }
      if (params.action === 'findMany') {
        // Find many queries
        if (params.args.where) {
          if (params.args.where.deleted_at == undefined) {
            // Exclude deleted_at records if they have not been explicitly requested
            params.args.where['deleted_at'] = null;
          }
        } else {
          params.args['where'] = { deleted_at: null };
        }
      }
      return next(params);
    });

    this.$use(async (params, next) => {
      // if (params.action == 'update') {
      //   // Change to updateMany - you cannot filter
      //   // by anything except ID / unique with findUnique
      //   params.action = 'updateMany';
      //   // Add 'deleted_at' filter
      //   // ID filter maintained
      //   params.args.where['deleted_at'] = null;
      // }
      if (params.action == 'updateMany') {
        if (params.args.where != undefined) {
          params.args.where['deleted_at'] = null;
        } else {
          params.args['where'] = { deleted_at: null };
        }
      }
      return next(params);
    });

    this.$use(async (params, next) => {
      const skipSoftDelete = ['media'];
      if (params.action == 'delete' && !skipSoftDelete.includes(params.model)) {
        // Delete queries
        // Change action to an update
        params.action = 'update';
        params.args['data'] = { deleted_at: new Date() };
      }
      if (
        params.action == 'deleteMany' &&
        !skipSoftDelete.includes(params.model)
      ) {
        // Delete many queries
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['deleted_at'] = new Date();
        } else {
          params.args['data'] = { deleted_at: new Date() };
        }
      }
      return next(params);
    });

    this.logger.log(`Prisma v${Prisma.prismaVersion.client}`);
    this.$on('query', (e) => this.logger.debug(`${e.query} ${e.params}`));
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async onApplicationShutdown() {
    await this.$disconnect();
  }
}
