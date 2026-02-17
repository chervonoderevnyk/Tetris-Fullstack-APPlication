export class Config {
  // Server Configuration
  static readonly PORT = parseInt(process.env.PORT || '3001');
  static readonly NODE_ENV = process.env.NODE_ENV || 'development';
  static readonly IS_PRODUCTION = Config.NODE_ENV === 'production';

  // Database
  static readonly DATABASE_URL = process.env.DATABASE_URL || '';

  // JWT Configuration
  static readonly JWT_SECRET = process.env.JWT_SECRET || 'tetris_secret';
  static readonly REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET || 'tetris_refresh_secret';
  static readonly JWT_EXPIRES_IN = '15m';
  static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  // CORS Configuration
  static readonly CORS_ORIGINS = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:4200', 'http://127.0.0.1:4200'];
  static readonly CORS_CREDENTIALS = process.env.CORS_CREDENTIALS === 'true';

  // Cookie Configuration
  static readonly COOKIE_MAX_AGE_DAYS = parseInt(process.env.COOKIE_MAX_AGE_DAYS || '7');
  static readonly COOKIE_MAX_AGE_MS = Config.COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  static readonly COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || Config.IS_PRODUCTION;
  static readonly COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE || 'strict') as 'strict' | 'lax' | 'none';
  static readonly COOKIE_HTTP_ONLY = process.env.COOKIE_HTTP_ONLY !== 'false';
  static readonly COOKIE_PATH = process.env.COOKIE_PATH || '/';
  static readonly COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

  // Security
  static readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');
  
  // Rate Limiting
  static readonly RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  static readonly RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

  // HTTPS Configuration
  static readonly HTTPS_ENABLED = process.env.HTTPS_ENABLED === 'true' || Config.IS_PRODUCTION;
  static readonly HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '3443');
  static readonly HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
  static readonly HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;

  // Validation
  static validate(): void {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET', 
      'REFRESH_JWT_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (Config.IS_PRODUCTION) {
      const productionRequired = [
        'COOKIE_DOMAIN'
      ];
      
      const missingProd = productionRequired.filter(key => !process.env[key]);
      if (missingProd.length > 0) {
        console.warn(`Warning: Missing production environment variables: ${missingProd.join(', ')}`);
      }
    }
  }

  static logConfiguration(): void {
    console.log('🔧 Server Configuration:');
    console.log(`  Environment: ${Config.NODE_ENV}`);
    console.log(`  Port: ${Config.PORT}`);
    console.log(`  CORS Origins: ${Config.CORS_ORIGINS.join(', ')}`);
    console.log(`  Cookie Secure: ${Config.COOKIE_SECURE}`);
    console.log(`  Cookie SameSite: ${Config.COOKIE_SAME_SITE}`);
  }
}