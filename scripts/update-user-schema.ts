import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Updating user table schema...");

  try {
    // Add the new document columns to users table
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS document_path TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS document_type TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS document_verified BOOLEAN DEFAULT false;
    `);
    
    console.log("User schema update completed successfully!");
  } catch (error) {
    console.error("Error during user schema update:", error);
  } finally {
    process.exit(0);
  }
}

main();