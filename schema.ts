import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("security"),
  document_path: text("document_path"), // Path to uploaded security license or RSA
  document_type: text("document_type"), // 'security_license' or 'rsa_certificate'
  document_verified: boolean("document_verified").default(false),
});

export type UserRole = 'admin' | 'manager' | 'security' | 'staff';
export type DocumentType = 'security_license' | 'rsa_certificate';

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  document_path: true,
  document_type: true,
  document_verified: true,
}).extend({
  role: z.enum(['admin', 'manager', 'security', 'staff']).default('security'),
  document_type: z.enum(['security_license', 'rsa_certificate']).optional(),
});

// Venue schema
export const venues = pgTable("venues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  contact: text("contact").notNull(),
  status: text("status").notNull().default("closed"),
});

export const insertVenueSchema = createInsertSchema(venues).pick({
  name: true,
  address: true,
  contact: true,
  status: true,
});

// Incident schema
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  date: timestamp("date").notNull(),
  venue_id: integer("venue_id").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  involved_parties: text("involved_parties"),
  actions_taken: text("actions_taken"),
  witnesses: text("witnesses"),
  reported_by: text("reported_by").notNull(),
  position: text("position").notNull(),
  
  // Approval workflow fields
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewed_by: integer("reviewed_by"), // user ID of the manager/admin who reviewed
  review_date: timestamp("review_date"), // when was the review done
  review_notes: text("review_notes"), // notes added by the reviewer
  created_by: integer("created_by"), // user ID who created the incident
});

export type IncidentStatus = 'pending' | 'approved' | 'rejected';

export const insertIncidentSchema = createInsertSchema(incidents).pick({
  type: true,
  severity: true,
  date: true,
  venue_id: true,
  location: true,
  description: true,
  involved_parties: true,
  actions_taken: true,
  witnesses: true,
  reported_by: true,
  position: true,
  status: true,
  created_by: true,
}).extend({
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

// Security Sign-In schema
export const securitySignIns = pgTable("security_sign_ins", {
  id: serial("id").primaryKey(),
  security_name: text("security_name").notNull(),
  badge_number: text("badge_number").notNull(),
  venue_id: integer("venue_id").notNull(),
  position: text("position").notNull(),
  date: timestamp("date").notNull(),
  time_in: timestamp("time_in").notNull(),
  time_out: timestamp("time_out"),
  notes: text("notes"),
  status: text("status").notNull().default("on-duty"),
});

export const insertSecuritySignInSchema = createInsertSchema(securitySignIns).pick({
  security_name: true,
  badge_number: true,
  venue_id: true,
  position: true,
  date: true,
  time_in: true,
  time_out: true,
  notes: true,
  status: true,
});

// CCTV Camera schema
export const cctvCameras = pgTable("cctv_cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  venue_id: integer("venue_id").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertCctvCameraSchema = createInsertSchema(cctvCameras).pick({
  name: true,
  location: true,
  venue_id: true,
  type: true,
  status: true,
  notes: true,
});

// CCTV Check schema
export const cctvChecks = pgTable("cctv_checks", {
  id: serial("id").primaryKey(),
  camera_id: integer("camera_id").notNull(),
  checked_by: integer("checked_by").notNull(), // User ID
  venue_id: integer("venue_id").notNull(),
  check_time: timestamp("check_time").notNull().defaultNow(),
  shift_type: text("shift_type").notNull(), // 'start' or 'end'
  status: text("status").notNull(), // 'working', 'issue', 'offline'
  issue_description: text("issue_description"),
  action_taken: text("action_taken"),
  resolved: boolean("resolved").default(false),
});

export const insertCctvCheckSchema = createInsertSchema(cctvChecks).pick({
  camera_id: true,
  checked_by: true,
  venue_id: true,
  shift_type: true,
  status: true,
  issue_description: true,
  action_taken: true,
  resolved: true,
});

// Shift Schedule schema
export const shiftSchedules = pgTable("shift_schedules", {
  id: serial("id").primaryKey(),
  venue_id: integer("venue_id").notNull(),
  name: text("name").notNull(),
  start_time: text("start_time").notNull(), // Time in 24h format (HH:MM)
  end_time: text("end_time").notNull(),     // Time in 24h format (HH:MM) 
  active: boolean("active").default(true),
});

export const insertShiftScheduleSchema = createInsertSchema(shiftSchedules).pick({
  venue_id: true,
  name: true,
  start_time: true,
  end_time: true,
  active: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Venue = typeof venues.$inferSelect;
export type InsertVenue = z.infer<typeof insertVenueSchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

export type SecuritySignIn = typeof securitySignIns.$inferSelect;
export type InsertSecuritySignIn = z.infer<typeof insertSecuritySignInSchema>;

export type CctvCamera = typeof cctvCameras.$inferSelect;
export type InsertCctvCamera = z.infer<typeof insertCctvCameraSchema>;

export type CctvCheck = typeof cctvChecks.$inferSelect;
export type InsertCctvCheck = z.infer<typeof insertCctvCheckSchema>;

export type ShiftSchedule = typeof shiftSchedules.$inferSelect;
export type InsertShiftSchedule = z.infer<typeof insertShiftScheduleSchema>;
