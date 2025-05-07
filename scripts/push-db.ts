#!/usr/bin/env tsx
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";

// This is needed for the Neon serverless driver to work in Node.js
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL env var is required");
  }

  // Create a connection pool to PostgreSQL
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Create a drizzle instance using the pool and schema
  const db = drizzle(pool, { schema });

  console.log("Pushing schema to database...");
  // This will create/update the tables in the database to match your schema
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Schema pushed successfully!");

  // Close the pool
  await pool.end();
}

main().catch((err) => {
  console.error("Error pushing schema:", err);
  process.exit(1);
});