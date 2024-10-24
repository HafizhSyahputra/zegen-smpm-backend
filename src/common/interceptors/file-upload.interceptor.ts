import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter } from '../utils/upload';
import * as fs from 'fs';
import { randomString } from '../utils/string';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const FileUploadInterceptor = ({
  name,
  dirPath,
  prefixName,
  maxSize = 6,
  maxCount = 20,
  ext = ['jpg', 'jpeg', 'png', 'gif', 'xlsx', 'pdf', 'doc', 'docx', 'ppt', 'pptx'],
}: {
  name: string;
  dirPath: string;
  prefixName?: string;
  maxSize?: number;
  maxCount?: number;
  ext?: string[];
}) =>
  FilesInterceptor(name, maxCount, {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        fs.mkdirSync(dirPath, { recursive: true });
        callback(null, dirPath);
      },
      filename: (_req, file, callback) => {
        const extension = file.originalname.split('.').pop();
        callback(
          null,
          `${prefixName ? `${prefixName}-` : null}${Date.now()}-${randomString(
            10,
          ).toLowerCase()}.${extension}`,
        );
      },
    }),
    fileFilter: fileFilter(ext),
    limits: { fileSize: maxSize * 1024 * 1024 },
  });

export const FileUploadFieldsInterceptor = ({
  fields = [],
  dirPath,
  prefixName,
  maxSize = 6,
}: {
  fields: MulterField[];
  dirPath: string;
  prefixName?: string;
  maxSize?: number;
}) =>
  FileFieldsInterceptor(fields, {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        fs.mkdirSync(dirPath, { recursive: true });
        callback(null, dirPath);
      },
      filename: (_req, file, callback) => {
        const extension = file.originalname.split('.').pop();
        callback(
          null,
          `${prefixName ? `${prefixName}-` : null}${Date.now()}-${randomString(
            10,
          ).toLowerCase()}.${extension}`,
        );
      },
    }),
    fileFilter: fileFilter,
    limits: { fileSize: maxSize * 1024 * 1024 },
  });
