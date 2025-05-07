import { db } from "../server/db";
import { users } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  try {
    console.log("Creating test users...");

    // Create admin user
    await db.insert(users).values({
      username: "admin",
      password: await hashPassword("adminpass"),
      name: "Admin User",
      email: "admin@test.com",
      role: "admin"
    });
    console.log("Created admin user: username=admin, password=adminpass");

    // Create manager user
    await db.insert(users).values({
      username: "manager",
      password: await hashPassword("manager123"),
      name: "Manager User",
      email: "manager@test.com",
      role: "manager"
    });
    console.log("Created manager user: username=manager, password=manager123");

    // Create security user (with pending document)
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

    // Create staff user (with verified document)
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

    console.log("Test users created successfully!");
  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    process.exit(0);
  }
}

main();