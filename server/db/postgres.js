let sqlClient = null;

const getDatabaseUrl = () => process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

const getSql = () => {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    const error = new Error('SUPABASE_DATABASE_URL is not configured');
    error.status = 503;
    throw error;
  }

  if (!sqlClient) {
    const postgres = require('postgres');
    sqlClient = postgres(databaseUrl, {
      max: Number.parseInt(process.env.SUPABASE_DATABASE_POOL_SIZE || '5', 10),
      ssl: databaseUrl.includes('sslmode=') ? undefined : 'require',
    });
  }

  return sqlClient;
};

module.exports = {
  getSql,
};
