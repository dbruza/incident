import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Forcing schema update for incidents table...");

  try {
    // Drop and recreate the incidents table with the new schema
    await db.execute(sql`
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS reviewed_by INTEGER;
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS review_date TIMESTAMP;
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS review_notes TEXT;
      ALTER TABLE incidents ADD COLUMN IF NOT EXISTS created_by INTEGER;
      
      -- Update existing records to have status = 'approved' 
      UPDATE incidents SET status = 'approved' WHERE status = 'pending';
    `);
    
    console.log("Schema update completed successfully!");
  } catch (error) {
    console.error("Error during schema update:", error);
  } finally {
    process.exit(0);
  }
}

main();