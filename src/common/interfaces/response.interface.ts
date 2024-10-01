export interface Response<T> {
  status: {
    code: number;
    description: string;
  };
  result: {
    data?: T;
    error?: any;
    errors?: any;
  } | null;
}
