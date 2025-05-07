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
  console.log("Creating demo users with different role levels...");

  try {
    // Create a manager user
    const managerPassword = await hashPassword("manager123");
    const [manager] = await db
      .insert(users)
      .values({
        username: "manager",
        password: managerPassword,
        name: "Venue Manager",
        email: "manager@idunightclub.com",
        role: "manager",
      })
      .returning();

    console.log("Manager user created:", {
      id: manager.id,
      username: manager.username,
      name: manager.name,
      role: manager.role,
    });

    // Create a security user
    const securityPassword = await hashPassword("security1234");
    const [security] = await db
      .insert(users)
      .values({
        username: "security",
        password: securityPassword,
        name: "Security Guard",
        email: "security@idunightclub.com",
        role: "security",
      })
      .returning();

    console.log("Security user created:", {
      id: security.id,
      username: security.username,
      name: security.name,
      role: security.role,
    });

    console.log("Demo users created successfully!");
    console.log("\nLogin credentials:");
    console.log("- Admin: username='admin', password='adminpass'");
    console.log("- Manager: username='manager', password='manager123'");
    console.log("- Security: username='security', password='security123'");
  } catch (error) {
    console.error("Error creating demo users:", error);
  } finally {
    process.exit(0);
  }
}

main();
