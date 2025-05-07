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

// Main function to add users
async function main() {
  try {
    console.log("Adding test users...");

    // Admin user
    const adminExists = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    if (adminExists.length === 0) {
      await db.insert(users).values({
        username: "admin",
        password: await hashPassword("adminpass"),
        name: "Admin User",
        email: "admin@test.com",
        role: "admin"
      });
      console.log("Created admin user: username=admin, password=adminpass");
    } else {
      console.log("Admin user already exists");
    }

    // Manager user
    const managerExists = await db.select().from(users).where(eq(users.username, "manager")).limit(1);
    if (managerExists.length === 0) {
      await db.insert(users).values({
        username: "manager",
        password: await hashPassword("manager123"),
        name: "Manager User",
        email: "manager@test.com",
        role: "manager"
      });
      console.log("Created manager user: username=manager, password=manager123");
    } else {
      console.log("Manager user already exists");
    }

    // Security user (with document pending verification)
    const securityExists = await db.select().from(users).where(eq(users.username, "security")).limit(1);
    if (securityExists.length === 0) {
      await db.insert(users).values({
        username: "security",
        password: await hashPassword("security123"),
        name: "Security User",
        email: "security@test.com",
        role: "security",
        document_type: "security_license",
        document_path: "/uploads/placeholder-document.pdf",
        document_verified: false
      });
      console.log("Created security user: username=security, password=security123");
    } else {
      console.log("Security user already exists");
    }

    // Staff user (with document already verified)
    const staffExists = await db.select().from(users).where(eq(users.username, "staff")).limit(1);
    if (staffExists.length === 0) {
      await db.insert(users).values({
        username: "staff",
        password: await hashPassword("staff123"),
        name: "Staff User",
        email: "staff@test.com",
        role: "staff",
        document_type: "rsa_certificate",
        document_path: "/uploads/placeholder-document.pdf",
        document_verified: true
      });
      console.log("Created staff user: username=staff, password=staff123");
    } else {
      console.log("Staff user already exists");
    }

    console.log("Test users created successfully!");
  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    process.exit(0);
  }
}

main();