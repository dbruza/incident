import { db } from "../server/db";
import { users } from "../shared/schema";

async function main() {
  try {
    console.log("Listing all users...");
    
    const allUsers = await db.select().from(users);
    
    console.log("Found", allUsers.length, "users:");
    allUsers.forEach(user => {
      // Don't print the hashed password
      const { password, ...userInfo } = user;
      console.log(userInfo);
    });
    
  } catch (error) {
    console.error("Error listing users:", error);
  } finally {
    process.exit(0);
  }
}

main();