import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';  
import { MediaService } from './media.service';  
import { Response } from 'express';  
import * as path from 'path';  

@Controller('media')  
export class MediaController {  
  constructor(private readonly mediaService: MediaService) {}  

  @Get(':id')  
  async getMedia(@Param('id') id: number, @Res() res: Response) {  
    try {  
      const media = await this.mediaService.findMediaById(id);  
      if (!media) {  
         return res.status(HttpStatus.NOT_FOUND).send('Media not found');  
      }  

      console.log('Media found:', media);  

      const uploadsDir = path.resolve('uploads');   
      const filePath = path.join(uploadsDir, media.path);  

      console.log('Full file path:', filePath);   

      res.setHeader('Content-Type', media.mime);   
      res.sendFile(filePath); 
    } catch (error) {  
      console.error(error);  
      res.status(HttpStatus.NOT_FOUND).send('Media not found');  
    }  
  }  
}