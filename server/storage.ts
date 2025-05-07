import { 
  users, type User, type InsertUser, 
  venues, type Venue, type InsertVenue, 
  incidents, type Incident, type InsertIncident, 
  securitySignIns, type SecuritySignIn, type InsertSecuritySignIn,
  cctvCameras, type CctvCamera, type InsertCctvCamera,
  cctvChecks, type CctvCheck, type InsertCctvCheck,
  shiftSchedules, type ShiftSchedule, type InsertShiftSchedule
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { db } from "./db";
import { eq, and, SQL, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create session stores
const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Venues
  getVenue(id: number): Promise<Venue | undefined>;
  getVenues(): Promise<Venue[]>;
  createVenue(venue: InsertVenue): Promise<Venue>;
  updateVenue(id: number, venue: Partial<InsertVenue>): Promise<Venue | undefined>;
  deleteVenue(id: number): Promise<boolean>;
  
  // Incidents
  getIncident(id: number): Promise<Incident | undefined>;
  getIncidents(): Promise<Incident[]>;
  getIncidentsByVenue(venueId: number): Promise<Incident[]>;
  getIncidentsByStatus(status: string): Promise<Incident[]>;
  getIncidentsByUser(userId: number): Promise<Incident[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident | undefined>;
  deleteIncident(id: number): Promise<boolean>;
  approveIncident(id: number, reviewerId: number, notes?: string): Promise<Incident | undefined>;
  rejectIncident(id: number, reviewerId: number, notes?: string): Promise<Incident | undefined>;
  
  // Security Sign-Ins
  getSecuritySignIn(id: number): Promise<SecuritySignIn | undefined>;
  getSecuritySignIns(): Promise<SecuritySignIn[]>;
  getActiveSecuritySignIns(): Promise<SecuritySignIn[]>;
  getSecuritySignInsByVenue(venueId: number): Promise<SecuritySignIn[]>;
  createSecuritySignIn(signIn: InsertSecuritySignIn): Promise<SecuritySignIn>;
  updateSecuritySignIn(id: number, signIn: Partial<InsertSecuritySignIn>): Promise<SecuritySignIn | undefined>;
  signOutSecurity(id: number, timeOut: Date): Promise<SecuritySignIn | undefined>;
  
  // CCTV Cameras
  getCctvCamera(id: number): Promise<CctvCamera | undefined>;
  getCctvCameras(): Promise<CctvCamera[]>;
  getCctvCamerasByVenue(venueId: number): Promise<CctvCamera[]>;
  createCctvCamera(camera: InsertCctvCamera): Promise<CctvCamera>;
  updateCctvCamera(id: number, camera: Partial<InsertCctvCamera>): Promise<CctvCamera | undefined>;
  deleteCctvCamera(id: number): Promise<boolean>;
  
  // CCTV Checks
  getCctvCheck(id: number): Promise<CctvCheck | undefined>;
  getCctvChecks(): Promise<CctvCheck[]>;
  getCctvChecksByVenue(venueId: number): Promise<CctvCheck[]>;
  getCctvChecksByCamera(cameraId: number): Promise<CctvCheck[]>;
  getRecentCctvChecks(venueId: number, limit?: number): Promise<CctvCheck[]>;
  createCctvCheck(check: InsertCctvCheck): Promise<CctvCheck>;
  resolveCctvIssue(id: number, actionTaken: string): Promise<CctvCheck | undefined>;
  
  // Shift Schedules
  getShiftSchedule(id: number): Promise<ShiftSchedule | undefined>;
  getShiftSchedules(): Promise<ShiftSchedule[]>;
  getShiftSchedulesByVenue(venueId: number): Promise<ShiftSchedule[]>;
  createShiftSchedule(schedule: InsertShiftSchedule): Promise<ShiftSchedule>;
  updateShiftSchedule(id: number, schedule: Partial<InsertShiftSchedule>): Promise<ShiftSchedule | undefined>;
  deleteShiftSchedule(id: number): Promise<boolean>;
  
  // Session Store
  sessionStore: any; // Using any type to avoid SessionStore type error
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for session store type

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Venues
  async getVenue(id: number): Promise<Venue | undefined> {
    const [venue] = await db.select().from(venues).where(eq(venues.id, id));
    return venue;
  }

  async getVenues(): Promise<Venue[]> {
    return await db.select().from(venues);
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const [newVenue] = await db.insert(venues).values(venue).returning();
    return newVenue;
  }

  async updateVenue(id: number, venue: Partial<InsertVenue>): Promise<Venue | undefined> {
    const [updatedVenue] = await db.update(venues)
      .set(venue)
      .where(eq(venues.id, id))
      .returning();
    return updatedVenue;
  }

  async deleteVenue(id: number): Promise<boolean> {
    const result = await db.delete(venues).where(eq(venues.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Incidents
  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents);
  }

  async getIncidentsByVenue(venueId: number): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.venue_id, venueId));
  }
  
  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.status, status));
  }
  
  async getIncidentsByUser(userId: number): Promise<Incident[]> {
    return await db.select().from(incidents).where(eq(incidents.created_by, userId));
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
    return newIncident;
  }

  async updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident | undefined> {
    const [updatedIncident] = await db.update(incidents)
      .set(incident)
      .where(eq(incidents.id, id))
      .returning();
    return updatedIncident;
  }

  async deleteIncident(id: number): Promise<boolean> {
    const result = await db.delete(incidents).where(eq(incidents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async approveIncident(id: number, reviewerId: number, notes?: string): Promise<Incident | undefined> {
    const [approvedIncident] = await db.update(incidents)
      .set({
        status: "approved",
        reviewed_by: reviewerId,
        review_date: new Date(),
        review_notes: notes || null
      })
      .where(eq(incidents.id, id))
      .returning();
    return approvedIncident;
  }
  
  async rejectIncident(id: number, reviewerId: number, notes?: string): Promise<Incident | undefined> {
    const [rejectedIncident] = await db.update(incidents)
      .set({
        status: "rejected",
        reviewed_by: reviewerId,
        review_date: new Date(),
        review_notes: notes || null
      })
      .where(eq(incidents.id, id))
      .returning();
    return rejectedIncident;
  }

  // Security Sign-Ins
  async getSecuritySignIn(id: number): Promise<SecuritySignIn | undefined> {
    const [signIn] = await db.select().from(securitySignIns).where(eq(securitySignIns.id, id));
    return signIn;
  }

  async getSecuritySignIns(): Promise<SecuritySignIn[]> {
    return await db.select().from(securitySignIns);
  }

  async getActiveSecuritySignIns(): Promise<SecuritySignIn[]> {
    return await db.select().from(securitySignIns).where(eq(securitySignIns.status, "on-duty"));
  }

  async getSecuritySignInsByVenue(venueId: number): Promise<SecuritySignIn[]> {
    return await db.select().from(securitySignIns).where(eq(securitySignIns.venue_id, venueId));
  }

  async createSecuritySignIn(signIn: InsertSecuritySignIn): Promise<SecuritySignIn> {
    const [newSignIn] = await db.insert(securitySignIns).values(signIn).returning();
    return newSignIn;
  }

  async updateSecuritySignIn(id: number, signIn: Partial<InsertSecuritySignIn>): Promise<SecuritySignIn | undefined> {
    const [updatedSignIn] = await db.update(securitySignIns)
      .set(signIn)
      .where(eq(securitySignIns.id, id))
      .returning();
    return updatedSignIn;
  }

  async signOutSecurity(id: number, timeOut: Date): Promise<SecuritySignIn | undefined> {
    const [updatedSignIn] = await db.update(securitySignIns)
      .set({
        time_out: timeOut,
        status: "off-duty"
      })
      .where(eq(securitySignIns.id, id))
      .returning();
    return updatedSignIn;
  }
  
  // CCTV Cameras
  async getCctvCamera(id: number): Promise<CctvCamera | undefined> {
    const [camera] = await db.select().from(cctvCameras).where(eq(cctvCameras.id, id));
    return camera;
  }

  async getCctvCameras(): Promise<CctvCamera[]> {
    return await db.select().from(cctvCameras);
  }

  async getCctvCamerasByVenue(venueId: number): Promise<CctvCamera[]> {
    return await db.select().from(cctvCameras).where(eq(cctvCameras.venue_id, venueId));
  }

  async createCctvCamera(camera: InsertCctvCamera): Promise<CctvCamera> {
    const [newCamera] = await db.insert(cctvCameras).values(camera).returning();
    return newCamera;
  }

  async updateCctvCamera(id: number, camera: Partial<InsertCctvCamera>): Promise<CctvCamera | undefined> {
    const [updatedCamera] = await db.update(cctvCameras)
      .set(camera)
      .where(eq(cctvCameras.id, id))
      .returning();
    return updatedCamera;
  }

  async deleteCctvCamera(id: number): Promise<boolean> {
    const result = await db.delete(cctvCameras).where(eq(cctvCameras.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // CCTV Checks
  async getCctvCheck(id: number): Promise<CctvCheck | undefined> {
    const [check] = await db.select().from(cctvChecks).where(eq(cctvChecks.id, id));
    return check;
  }

  async getCctvChecks(): Promise<CctvCheck[]> {
    return await db.select().from(cctvChecks);
  }

  async getCctvChecksByVenue(venueId: number): Promise<CctvCheck[]> {
    return await db.select().from(cctvChecks).where(eq(cctvChecks.venue_id, venueId));
  }

  async getCctvChecksByCamera(cameraId: number): Promise<CctvCheck[]> {
    return await db.select().from(cctvChecks).where(eq(cctvChecks.camera_id, cameraId));
  }

  async getRecentCctvChecks(venueId: number, limit: number = 10): Promise<CctvCheck[]> {
    return await db.select()
      .from(cctvChecks)
      .where(eq(cctvChecks.venue_id, venueId))
      .orderBy(desc(cctvChecks.check_time))
      .limit(limit);
  }

  async createCctvCheck(check: InsertCctvCheck): Promise<CctvCheck> {
    const [newCheck] = await db.insert(cctvChecks).values(check).returning();
    return newCheck;
  }

  async resolveCctvIssue(id: number, actionTaken: string): Promise<CctvCheck | undefined> {
    const [updatedCheck] = await db.update(cctvChecks)
      .set({
        action_taken: actionTaken,
        resolved: true
      })
      .where(eq(cctvChecks.id, id))
      .returning();
    return updatedCheck;
  }
  
  // Shift Schedules
  async getShiftSchedule(id: number): Promise<ShiftSchedule | undefined> {
    const [schedule] = await db.select().from(shiftSchedules).where(eq(shiftSchedules.id, id));
    return schedule;
  }

  async getShiftSchedules(): Promise<ShiftSchedule[]> {
    return await db.select().from(shiftSchedules);
  }

  async getShiftSchedulesByVenue(venueId: number): Promise<ShiftSchedule[]> {
    return await db.select().from(shiftSchedules).where(eq(shiftSchedules.venue_id, venueId));
  }

  async createShiftSchedule(schedule: InsertShiftSchedule): Promise<ShiftSchedule> {
    const [newSchedule] = await db.insert(shiftSchedules).values(schedule).returning();
    return newSchedule;
  }

  async updateShiftSchedule(id: number, schedule: Partial<InsertShiftSchedule>): Promise<ShiftSchedule | undefined> {
    const [updatedSchedule] = await db.update(shiftSchedules)
      .set(schedule)
      .where(eq(shiftSchedules.id, id))
      .returning();
    return updatedSchedule;
  }

  async deleteShiftSchedule(id: number): Promise<boolean> {
    const result = await db.delete(shiftSchedules).where(eq(shiftSchedules.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

// Memory storage implementation (kept for reference but no longer used)
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private venues: Map<number, Venue>;
  private incidents: Map<number, Incident>;
  private securitySignIns: Map<number, SecuritySignIn>;
  private cctvCameras: Map<number, CctvCamera>;
  private cctvChecks: Map<number, CctvCheck>;
  private shiftSchedules: Map<number, ShiftSchedule>;
  private userIdCounter: number;
  private venueIdCounter: number;
  private incidentIdCounter: number;
  private securitySignInIdCounter: number;
  private cctvCameraIdCounter: number;
  private cctvCheckIdCounter: number;
  private shiftScheduleIdCounter: number;
  sessionStore: any; // Using any for session store type

  constructor() {
    this.users = new Map();
    this.venues = new Map();
    this.incidents = new Map();
    this.securitySignIns = new Map();
    this.cctvCameras = new Map();
    this.cctvChecks = new Map();
    this.shiftSchedules = new Map();
    this.userIdCounter = 1;
    this.venueIdCounter = 1;
    this.incidentIdCounter = 1;
    this.securitySignInIdCounter = 1;
    this.cctvCameraIdCounter = 1;
    this.cctvCheckIdCounter = 1;
    this.shiftScheduleIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "adminpass",
      name: "Admin User",
      email: "admin@nightguard.com",
      role: "admin"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Venues
  async getVenue(id: number): Promise<Venue | undefined> {
    return this.venues.get(id);
  }

  async getVenues(): Promise<Venue[]> {
    return Array.from(this.venues.values());
  }

  async createVenue(venue: InsertVenue): Promise<Venue> {
    const id = this.venueIdCounter++;
    const newVenue: Venue = { ...venue, id };
    this.venues.set(id, newVenue);
    return newVenue;
  }

  async updateVenue(id: number, venue: Partial<InsertVenue>): Promise<Venue | undefined> {
    const existingVenue = this.venues.get(id);
    if (!existingVenue) return undefined;
    
    const updatedVenue = { ...existingVenue, ...venue };
    this.venues.set(id, updatedVenue);
    return updatedVenue;
  }

  async deleteVenue(id: number): Promise<boolean> {
    return this.venues.delete(id);
  }

  // Incidents
  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async getIncidentsByVenue(venueId: number): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      (incident) => incident.venue_id === venueId,
    );
  }
  
  async getIncidentsByStatus(status: string): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      (incident) => incident.status === status,
    );
  }
  
  async getIncidentsByUser(userId: number): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      (incident) => incident.created_by === userId,
    );
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const id = this.incidentIdCounter++;
    const newIncident: Incident = { 
      ...incident, 
      id,
      reviewed_by: null,
      review_date: null,
      review_notes: null
    };
    this.incidents.set(id, newIncident);
    return newIncident;
  }

  async updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident | undefined> {
    const existingIncident = this.incidents.get(id);
    if (!existingIncident) return undefined;
    
    const updatedIncident = { ...existingIncident, ...incident };
    this.incidents.set(id, updatedIncident);
    return updatedIncident;
  }

  async deleteIncident(id: number): Promise<boolean> {
    return this.incidents.delete(id);
  }
  
  async approveIncident(id: number, reviewerId: number, notes?: string): Promise<Incident | undefined> {
    const existingIncident = this.incidents.get(id);
    if (!existingIncident) return undefined;
    
    const approvedIncident = { 
      ...existingIncident, 
      status: "approved",
      reviewed_by: reviewerId,
      review_date: new Date(),
      review_notes: notes || null
    };
    this.incidents.set(id, approvedIncident);
    return approvedIncident;
  }
  
  async rejectIncident(id: number, reviewerId: number, notes?: string): Promise<Incident | undefined> {
    const existingIncident = this.incidents.get(id);
    if (!existingIncident) return undefined;
    
    const rejectedIncident = { 
      ...existingIncident, 
      status: "rejected",
      reviewed_by: reviewerId,
      review_date: new Date(),
      review_notes: notes || null
    };
    this.incidents.set(id, rejectedIncident);
    return rejectedIncident;
  }

  // Security Sign-Ins
  async getSecuritySignIn(id: number): Promise<SecuritySignIn | undefined> {
    return this.securitySignIns.get(id);
  }

  async getSecuritySignIns(): Promise<SecuritySignIn[]> {
    return Array.from(this.securitySignIns.values());
  }

  async getActiveSecuritySignIns(): Promise<SecuritySignIn[]> {
    return Array.from(this.securitySignIns.values()).filter(
      (signIn) => signIn.status === "on-duty",
    );
  }

  async getSecuritySignInsByVenue(venueId: number): Promise<SecuritySignIn[]> {
    return Array.from(this.securitySignIns.values()).filter(
      (signIn) => signIn.venue_id === venueId,
    );
  }

  async createSecuritySignIn(signIn: InsertSecuritySignIn): Promise<SecuritySignIn> {
    const id = this.securitySignInIdCounter++;
    const newSignIn: SecuritySignIn = { ...signIn, id };
    this.securitySignIns.set(id, newSignIn);
    return newSignIn;
  }

  async updateSecuritySignIn(id: number, signIn: Partial<InsertSecuritySignIn>): Promise<SecuritySignIn | undefined> {
    const existingSignIn = this.securitySignIns.get(id);
    if (!existingSignIn) return undefined;
    
    const updatedSignIn = { ...existingSignIn, ...signIn };
    this.securitySignIns.set(id, updatedSignIn);
    return updatedSignIn;
  }

  async signOutSecurity(id: number, timeOut: Date): Promise<SecuritySignIn | undefined> {
    const existingSignIn = this.securitySignIns.get(id);
    if (!existingSignIn) return undefined;
    
    const updatedSignIn = { 
      ...existingSignIn, 
      time_out: timeOut, 
      status: "off-duty" 
    };
    this.securitySignIns.set(id, updatedSignIn);
    return updatedSignIn;
  }
  
  // CCTV Cameras
  async getCctvCamera(id: number): Promise<CctvCamera | undefined> {
    return this.cctvCameras.get(id);
  }

  async getCctvCameras(): Promise<CctvCamera[]> {
    return Array.from(this.cctvCameras.values());
  }

  async getCctvCamerasByVenue(venueId: number): Promise<CctvCamera[]> {
    return Array.from(this.cctvCameras.values()).filter(
      (camera) => camera.venue_id === venueId,
    );
  }

  async createCctvCamera(camera: InsertCctvCamera): Promise<CctvCamera> {
    const id = this.cctvCameraIdCounter++;
    const newCamera: CctvCamera = { ...camera, id };
    this.cctvCameras.set(id, newCamera);
    return newCamera;
  }

  async updateCctvCamera(id: number, camera: Partial<InsertCctvCamera>): Promise<CctvCamera | undefined> {
    const existingCamera = this.cctvCameras.get(id);
    if (!existingCamera) return undefined;
    
    const updatedCamera = { ...existingCamera, ...camera };
    this.cctvCameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async deleteCctvCamera(id: number): Promise<boolean> {
    return this.cctvCameras.delete(id);
  }
  
  // CCTV Checks
  async getCctvCheck(id: number): Promise<CctvCheck | undefined> {
    return this.cctvChecks.get(id);
  }

  async getCctvChecks(): Promise<CctvCheck[]> {
    return Array.from(this.cctvChecks.values());
  }

  async getCctvChecksByVenue(venueId: number): Promise<CctvCheck[]> {
    return Array.from(this.cctvChecks.values()).filter(
      (check) => check.venue_id === venueId,
    );
  }

  async getCctvChecksByCamera(cameraId: number): Promise<CctvCheck[]> {
    return Array.from(this.cctvChecks.values()).filter(
      (check) => check.camera_id === cameraId,
    );
  }

  async getRecentCctvChecks(venueId: number, limit: number = 10): Promise<CctvCheck[]> {
    return Array.from(this.cctvChecks.values())
      .filter(check => check.venue_id === venueId)
      .sort((a, b) => b.check_time.getTime() - a.check_time.getTime())
      .slice(0, limit);
  }

  async createCctvCheck(check: InsertCctvCheck): Promise<CctvCheck> {
    const id = this.cctvCheckIdCounter++;
    const newCheck: CctvCheck = { ...check, id };
    this.cctvChecks.set(id, newCheck);
    return newCheck;
  }

  async resolveCctvIssue(id: number, actionTaken: string): Promise<CctvCheck | undefined> {
    const existingCheck = this.cctvChecks.get(id);
    if (!existingCheck) return undefined;
    
    const updatedCheck = { 
      ...existingCheck, 
      action_taken: actionTaken, 
      resolved: true 
    };
    this.cctvChecks.set(id, updatedCheck);
    return updatedCheck;
  }
  
  // Shift Schedules
  async getShiftSchedule(id: number): Promise<ShiftSchedule | undefined> {
    return this.shiftSchedules.get(id);
  }

  async getShiftSchedules(): Promise<ShiftSchedule[]> {
    return Array.from(this.shiftSchedules.values());
  }

  async getShiftSchedulesByVenue(venueId: number): Promise<ShiftSchedule[]> {
    return Array.from(this.shiftSchedules.values()).filter(
      (schedule) => schedule.venue_id === venueId,
    );
  }

  async createShiftSchedule(schedule: InsertShiftSchedule): Promise<ShiftSchedule> {
    const id = this.shiftScheduleIdCounter++;
    const newSchedule: ShiftSchedule = { ...schedule, id };
    this.shiftSchedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateShiftSchedule(id: number, schedule: Partial<InsertShiftSchedule>): Promise<ShiftSchedule | undefined> {
    const existingSchedule = this.shiftSchedules.get(id);
    if (!existingSchedule) return undefined;
    
    const updatedSchedule = { ...existingSchedule, ...schedule };
    this.shiftSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteShiftSchedule(id: number): Promise<boolean> {
    return this.shiftSchedules.delete(id);
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
