import { HttpException, HttpStatus } from '@nestjs/common';  

export class ValidationException extends HttpException {
  getErrors() {
    throw new Error('Method not implemented.');
  }  
  constructor(public validationErrors: any) {  
    super(  
      {  
        status: HttpStatus.BAD_REQUEST,  
        errors: validationErrors,  
      },  
      HttpStatus.BAD_REQUEST,  
    );  
  }  
}