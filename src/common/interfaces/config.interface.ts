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
