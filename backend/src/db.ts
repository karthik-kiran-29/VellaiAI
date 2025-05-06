// db.ts
import { Pool } from 'pg'

// Create a connection pool to manage Postgres connections efficiently.
// See node-postgres documentation for Pool options and performance tuning :contentReference[oaicite:0]{index=0}.
export const pool = new Pool({
  host: "localhost",
  port: Number(process.env.PG_PORT || 5432),
  user: "postgres",
  password: "scoot",
  database: "vellai",
  max: 10,            // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close & remove clients which have been idle > 30s
})

