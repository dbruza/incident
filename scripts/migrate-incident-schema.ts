import { db } from "../server/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Updating the incidents table schema to add approval workflow fields...");

  try {
    // Check if the status column exists
    const tableInfo = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'incidents' 
      AND column_name = 'status'
    `);
    
    // If the status column doesn't exist, add all the new columns
    if (tableInfo.length === 0) {
      console.log("Adding approval workflow columns to incidents table...");
      
      // Add status column with default 'pending'
      await db.execute(sql`
        ALTER TABLE incidents 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
      `);
      
      // Add reviewed_by column
      await db.execute(sql`
        ALTER TABLE incidents 
        ADD COLUMN reviewed_by INTEGER
      `);
      
      // Add review_date column
      await db.execute(sql`
        ALTER TABLE incidents 
        ADD COLUMN review_date TIMESTAMP
      `);
      
      // Add review_notes column
      await db.execute(sql`
        ALTER TABLE incidents 
        ADD COLUMN review_notes TEXT
      `);
      
      // Add created_by column
      await db.execute(sql`
        ALTER TABLE incidents 
        ADD COLUMN created_by INTEGER
      `);
      
      console.log("Migration completed successfully!");
    } else {
      console.log("Approval workflow schema already exists. No migration needed.");
    }
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    process.exit(0);
  }
}

main();