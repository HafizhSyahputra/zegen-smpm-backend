export default () => ({
  app: {
    environment: process.env.environment || 'development',
    port: parseInt(process.env.APP_PORT, 10) || 46,
    instances: process.env.APP_INSTANCES || 0,
    base_url: process.env.APP_BASE_URL,
    client_base_url: process.env.APP_CLIENT_BASE_URL,
  },
  throttle: {
    ttl: 60,
    limit: 100,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    ttl: process.env.JWT_TTL,
    refresh_ttl: process.env.JWT_REFRESH_TTL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
});
