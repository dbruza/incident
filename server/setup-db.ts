import { db } from "./db";
import { sql } from "drizzle-orm";

async function setupCctvTables() {
  console.log("Setting up CCTV tables...");
  
  // Create CCTV cameras table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cctv_cameras (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      venue_id INTEGER NOT NULL,
      location TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  
  // Create CCTV checks table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS cctv_checks (
      id SERIAL PRIMARY KEY,
      status TEXT NOT NULL,
      venue_id INTEGER NOT NULL,
      camera_id INTEGER NOT NULL,
      checked_by INTEGER NOT NULL,
      check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      shift_type TEXT NOT NULL,
      issue_description TEXT,
      action_taken TEXT,
      resolved BOOLEAN DEFAULT FALSE
    )
  `);
  
  // Create shift schedules table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS shift_schedules (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      venue_id INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      active BOOLEAN DEFAULT TRUE
    )
  `);

  console.log("CCTV tables created successfully!");
}

export { setupCctvTables };