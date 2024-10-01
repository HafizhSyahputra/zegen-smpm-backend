import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Response } from '@smpm/common/interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();

    // Check if the route handler has the 'Render' decorator
    const hasRenderDecorator = this.reflector.get<boolean>(
      'render',
      context.getHandler(),
    );

    if (hasRenderDecorator) {
      return next.handle(); // Skip the interceptor for rendering views
    }

    const responseMessage =
      this.reflector.get<string>('message', context.getHandler()) ?? 'OK';

    return next.handle().pipe(
      map((data) => {
        return {
          status: {
            code: ctx.getResponse().statusCode,
            description: responseMessage,
          },
          result: data,
        };
      }),
    );
  }
}
