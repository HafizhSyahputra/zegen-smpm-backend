import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as id from 'dayjs/locale/id';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { resolve } from 'path';
import * as compression from 'compression';
import { IAppConfig } from './common/interfaces/config.interface';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { formatValidationError } from './common/utils/validation-options';
import { GlobalGuard } from './common/guards/global.guard';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(localizedFormat);
  dayjs.locale(id);
  dayjs.tz.setDefault('Asia/Jakarta');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://103.82.242.180:5174',
    ],
    exposedHeaders: ['content-disposition'],
  });

  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  app.useStaticAssets(resolve(__dirname, '..', 'public'));
  app.setBaseViewsDir(resolve(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: formatValidationError,
    }),
  );

  app.useGlobalGuards(new GlobalGuard());

  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, configService));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {}),
  );

  app.use(compression());

  app.enableShutdownHooks();

  await app.listen(configService.get<IAppConfig>('app').port, '127.0.0.1');
}
bootstrap();
