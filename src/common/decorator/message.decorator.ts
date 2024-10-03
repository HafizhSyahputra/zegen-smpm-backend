// src/common/decorators/message.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Decorator untuk menetapkan pesan deskripsi pada handler route.
 * Pesan ini akan digunakan oleh ResponseInterceptor untuk mengisi field `description` dalam respons.
 * 
 * @param message - Pesan deskripsi yang ingin ditetapkan.
 */
export const Message = (message: string) => SetMetadata('message', message);