import { UPLOAD_TEMP_DIR } from '@smpm/constant/upload_file';
import { diskStorage } from 'multer';
import * as path from 'path';
var timestamp = new Date().getTime();

export const defaultConfig = diskStorage({
  destination: UPLOAD_TEMP_DIR,
  filename: (_, file, cb) => {
    cb(null, `${timestamp}_${file.originalname}`);
  },
});
