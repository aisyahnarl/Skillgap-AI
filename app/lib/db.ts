import { Pool, type QueryResult, type QueryResultRow } from 'pg';

let pool: Pool | null = null;
let isConnected = false;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('username:password')) {
    return null;
  }

  if (!pool) {
    try {
      pool = new Pool({
        connectionString,
        ssl: connectionString.includes('neon.tech') || connectionString.includes('supabase.co')
          ? { rejectUnauthorized: false }
          : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
      });

      pool.on('error', (err) => {
        console.warn('[PostgreSQL Pool Error]:', err.message);
        isConnected = false;
      });
    } catch (err: any) {
      console.warn('[PostgreSQL Init Warning]:', err.message);
      return null;
    }
  }

  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T> | null> {
  const dbPool = getDbPool();
  if (!dbPool) return null;

  try {
    const res = await dbPool.query<T>(text, params);
    isConnected = true;
    return res;
  } catch (err: any) {
    console.warn('[PostgreSQL Query Fallback]:', err.message);
    isConnected = false;
    return null;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
