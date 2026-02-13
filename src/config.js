require('dotenv').config();

module.exports = {
  // Server config
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database config
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'guru_legal_bot',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  // JWT config
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // WhatsApp config
  wa: {
    sessionDir: process.env.WA_SESSION_DIR || './wa_sessions',
  },

  // Uploads config
  uploads: {
    dir: process.env.UPLOADS_DIR || './uploads',
    maxSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB) || 25,
  },

  // Gemini AI config
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    enabled: process.env.GEMINI_ENABLED !== 'false' && !!process.env.GEMINI_API_KEY,
  },
};
