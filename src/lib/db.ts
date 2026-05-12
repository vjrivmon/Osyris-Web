import { Pool } from "pg"

// Singleton para no crear un pool nuevo en cada hot-reload
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "osyris_user",
      password: process.env.DB_PASSWORD || "osyris_password",
      database: process.env.DB_NAME || "osyris_db",
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    })
  }
  return global._pgPool
}

export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query(sql, params)
  return result.rows as T[]
}
