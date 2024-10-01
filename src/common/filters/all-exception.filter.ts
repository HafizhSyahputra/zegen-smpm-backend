import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { IAppConfig } from '../interfaces/config.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger();
  }

  catch(exception: any, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let error = undefined;
    let message = 'Internal server error';

    if (exception instanceof Error) {
      error = exception.message;
    }
    if (exception instanceof HttpException) {
      message = exception.message;
      error = undefined;
    }

    let errors: any;
    let data: any;
    if (
      httpStatus == HttpStatus.UNPROCESSABLE_ENTITY &&
      exception.getResponse()?.errors
    ) {
      errors = exception.getResponse().errors;
    } else {
      data = exception?.response;
      if (data) {
        delete data.message;
        delete data.error;
        delete data.statusCode;
        if (Object.keys(data).length === 0) data = undefined;
      }
    }

    this.configService.get<IAppConfig>('app').environment != 'development'
      ? (error = undefined)
      : this.logger.error(message, exception?.stack);

    const responseBody = {
      status: {
        code: httpStatus,
        description: message,
      },
      result:
        !errors && !error && !data
          ? null
          : {
              errors,
              error,
              ...data,
            },
      // timestamp: new Date().toISOString(),
      // path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
