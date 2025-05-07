import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  try {
    console.log("Updating existing users and adding new staff user...");

    // Update admin to have admin role
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.username, "admin"));
    console.log("Updated admin to have admin role");

    // Add staff user if it doesn't exist
    const staffExists = await db
      .select()
      .from(users)
      .where(eq(users.username, "staff"));
    
    if (staffExists.length === 0) {
      await db.insert(users).values({
        username: "staff",
        password: await hashPassword("staff123"),
        name: "Staff Member",
        email: "staff@idunightclub.com",
        role: "staff",
        document_type: "rsa_certificate",
        document_path: "/uploads/placeholder-document.pdf",
        document_verified: true
      });
      console.log("Added new staff user with RSA certificate");
    } else {
      console.log("Staff user already exists");
    }

    // Update security user to have a document path
    await db
      .update(users)
      .set({ 
        document_type: "security_license",
        document_path: "/uploads/placeholder-document.pdf",
        document_verified: false
      })
      .where(eq(users.username, "security"));
    console.log("Updated security user with pending document verification");

    console.log("User updates completed successfully!");
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    process.exit(0);
  }
}

main();