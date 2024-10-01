import { UnsupportedMediaTypeException } from '@nestjs/common';
import { extname } from 'path';

export const fileFilter =
  (allowedExtensions: string[]) => (req: any, file: any, callback: any) => {
    const allowedExtensionsRegex = new RegExp(
      `\\.(${allowedExtensions.join('|')})$`,
      'i',
    );

    if (!file.originalname.match(allowedExtensionsRegex)) {
      return callback(
        new UnsupportedMediaTypeException(
          `Files with extensions ${allowedExtensions.join(
            ', ',
          )} are supported. Please upload files with these extensions.`,
        ),
        false,
      );
    }

    callback(null, true);
  };

export const filename = (req: any, file: any, callback: any) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};
