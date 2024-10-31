export interface IAppConfig {
  environment: string;
  port: number;
  instances: number;
  base_url: string;
  client_base_url: string;
}

export interface IJwtConfig {
  secret: string;
  refresh_secret: string;
  ttl: string;
  refresh_ttl: string;
}

export interface IDatabaseConfig {
  url: string;
}

export interface IMailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface ValidationError {  
  row: number;  
  column: string;  
  value: string | null;  
  message: string;  
}  

export interface ValidationResult {  
  isValid: boolean;  
  data: AcknowledgeDto | null;  
  errors: ValidationError[];  
}  

export interface AcknowledgeDto {  
  no: string;  
  officer_name: string;  
}