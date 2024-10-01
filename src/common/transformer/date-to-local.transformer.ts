import * as dayjs from 'dayjs';

export const transformDatesToLocal = (data: any[]) => {
  return data.map((item) => {
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        if (item[key] instanceof Date) {
          // Convert UTC date to local date
          item[key] = dayjs.tz(item[key]).format();
        } else if (typeof item[key] === 'object' && !Array.isArray(item[key])) {
          item[key] = transformDatesToLocal([item[key]])[0];
        } else if (Array.isArray(item[key])) {
          item[key] = transformDatesToLocal(item[key]);
        }
      }
    }
    return item;
  });
};
