import { existsSync, unlink } from "fs";

export const deleteFile = (filePath: string): string => {
  if (existsSync(filePath)) {
    // Delete the file
    unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });
  } else {
    console.log('File does not exist');
  }
  return "Success Delete fil in directory " + filePath
};
