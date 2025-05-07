import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";
import { log } from "./vite";
import ws from "ws";
import { setupCctvTables } from "./setup-db";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL env var is required");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Function to create tables if they don't exist
export async function setupDatabase() {
  try {
    log("Setting up database tables...");
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL
      )
    `);
    
    // Create venues table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        contact TEXT NOT NULL,
        status TEXT NOT NULL
      )
    `);
    
    // Create incidents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        venue_id INTEGER NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        reported_by TEXT NOT NULL,
        position TEXT NOT NULL,
        involved_parties TEXT,
        actions_taken TEXT,
        witnesses TEXT
      )
    `);
    
    // Create security sign-ins table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS security_sign_ins (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP NOT NULL,
        security_name TEXT NOT NULL,
        badge_number TEXT NOT NULL,
        venue_id INTEGER NOT NULL,
        position TEXT NOT NULL,
        time_in TIMESTAMP NOT NULL,
        time_out TIMESTAMP,
        status TEXT NOT NULL,
        notes TEXT
      )
    `);
    
    // Setup CCTV-related tables
    await setupCctvTables();
    
    log("Database tables created successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}