export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSsl: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minio_admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minio_secret_key',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_key_change_me_in_prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_change_me_in_prod',
    expiration: process.env.JWT_EXPIRATION || '3600s',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '604800s',
  },
});
