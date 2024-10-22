 export class DateUtils {  
    static validateAndParseDate(dateString: Date | undefined): Date | null {  
      if (dateString) {  
        const date = new Date(dateString);  
        return isNaN(date.getTime()) ? null : date;  
      }  
      return null;  
    }  
  }  