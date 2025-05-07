import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertVenueSchema, 
  insertIncidentSchema, 
  insertSecuritySignInSchema,
  insertCctvCameraSchema,
  insertCctvCheckSchema,
  insertShiftScheduleSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer storage for document uploads
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Create multer upload instance with file filtering
const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: function (req, file, cb) {
    // Accept only specific file types for documents
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG or PDF files are allowed.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  await setupAuth(app);

  // Middleware to check if user is authenticated
  const ensureAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Venues CRUD
  app.get("/api/venues", ensureAuthenticated, async (req, res) => {
    try {
      const venues = await storage.getVenues();
      res.json(venues);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/venues/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const venue = await storage.getVenue(id);
      
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      res.json(venue);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/venues", ensureAuthenticated, async (req, res) => {
    try {
      console.log("Creating venue with data:", req.body);
      const venueData = insertVenueSchema.parse(req.body);
      console.log("Validated venue data:", venueData);
      const venue = await storage.createVenue(venueData);
      console.log("Venue created successfully:", venue);
      res.status(201).json(venue);
    } catch (error: any) {
      console.error("Error creating venue:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid venue data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/venues/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingVenue = await storage.getVenue(id);
      
      if (!existingVenue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      // Validate partial venue data
      const venueData = insertVenueSchema.partial().parse(req.body);
      const updatedVenue = await storage.updateVenue(id, venueData);
      res.json(updatedVenue);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid venue data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/venues/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVenue(id);
      
      if (!success) {
        return res.status(404).json({ message: "Venue not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Incidents CRUD
  app.get("/api/incidents", ensureAuthenticated, async (req, res) => {
    try {
      let incidents;
      const venueId = req.query.venueId ? parseInt(req.query.venueId as string) : undefined;
      const status = req.query.status as string;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (venueId) {
        incidents = await storage.getIncidentsByVenue(venueId);
      } else if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        incidents = await storage.getIncidentsByStatus(status);
      } else if (userId) {
        incidents = await storage.getIncidentsByUser(userId);
      } else {
        incidents = await storage.getIncidents();
      }
      
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/incidents/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const incident = await storage.getIncident(id);
      
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      res.json(incident);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/incidents", ensureAuthenticated, async (req, res) => {
    try {
      const incidentData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(incidentData);
      res.status(201).json(incident);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid incident data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/incidents/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingIncident = await storage.getIncident(id);
      
      if (!existingIncident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      // Validate partial incident data
      const incidentData = insertIncidentSchema.partial().parse(req.body);
      const updatedIncident = await storage.updateIncident(id, incidentData);
      res.json(updatedIncident);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid incident data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/incidents/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteIncident(id);
      
      if (!success) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Incident approval workflow endpoints
  app.get("/api/incidents/status/:status", ensureAuthenticated, async (req, res) => {
    try {
      const status = req.params.status;
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be pending, approved, or rejected." });
      }
      
      const incidents = await storage.getIncidentsByStatus(status);
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/incidents/user/:userId", ensureAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const incidents = await storage.getIncidentsByUser(userId);
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/incidents/:id/approve", ensureAuthenticated, async (req, res) => {
    try {
      // Ensure only admin or manager can approve
      const userRole = req.user?.role;
      if (userRole !== 'admin' && userRole !== 'manager') {
        return res.status(403).json({ message: "Not authorized. Only admin or manager can approve incidents." });
      }
      
      const id = parseInt(req.params.id);
      const reviewerId = req.user?.id || 0; // Default to 0 if ID is undefined (should never happen)
      const { notes } = req.body;
      
      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      if (incident.status !== 'pending') {
        return res.status(400).json({ message: `Incident is already ${incident.status}` });
      }
      
      const approvedIncident = await storage.approveIncident(id, reviewerId, notes);
      res.json(approvedIncident);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/incidents/:id/reject", ensureAuthenticated, async (req, res) => {
    try {
      // Ensure only admin or manager can reject
      const userRole = req.user?.role;
      if (userRole !== 'admin' && userRole !== 'manager') {
        return res.status(403).json({ message: "Not authorized. Only admin or manager can reject incidents." });
      }
      
      const id = parseInt(req.params.id);
      const reviewerId = req.user?.id || 0; // Default to 0 if ID is undefined (should never happen)
      const { notes } = req.body;
      
      if (!notes) {
        return res.status(400).json({ message: "Rejection notes are required" });
      }
      
      const incident = await storage.getIncident(id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      if (incident.status !== 'pending') {
        return res.status(400).json({ message: `Incident is already ${incident.status}` });
      }
      
      const rejectedIncident = await storage.rejectIncident(id, reviewerId, notes);
      res.json(rejectedIncident);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Security Sign-Ins CRUD
  app.get("/api/security-sign-ins", ensureAuthenticated, async (req, res) => {
    try {
      let signIns;
      const venueId = req.query.venueId ? parseInt(req.query.venueId as string) : undefined;
      const activeOnly = req.query.active === "true";
      
      if (venueId) {
        signIns = await storage.getSecuritySignInsByVenue(venueId);
      } else if (activeOnly) {
        signIns = await storage.getActiveSecuritySignIns();
      } else {
        signIns = await storage.getSecuritySignIns();
      }
      
      res.json(signIns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/security-sign-ins/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const signIn = await storage.getSecuritySignIn(id);
      
      if (!signIn) {
        return res.status(404).json({ message: "Security sign-in not found" });
      }
      
      res.json(signIn);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/security-sign-ins", ensureAuthenticated, async (req, res) => {
    try {
      const signInData = insertSecuritySignInSchema.parse(req.body);
      const signIn = await storage.createSecuritySignIn(signInData);
      res.status(201).json(signIn);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid security sign-in data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/security-sign-ins/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingSignIn = await storage.getSecuritySignIn(id);
      
      if (!existingSignIn) {
        return res.status(404).json({ message: "Security sign-in not found" });
      }
      
      // Validate partial sign-in data
      const signInData = insertSecuritySignInSchema.partial().parse(req.body);
      const updatedSignIn = await storage.updateSecuritySignIn(id, signInData);
      res.json(updatedSignIn);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid security sign-in data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Sign out a security staff member
  app.post("/api/security-sign-ins/:id/sign-out", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingSignIn = await storage.getSecuritySignIn(id);
      
      if (!existingSignIn) {
        return res.status(404).json({ message: "Security sign-in not found" });
      }
      
      if (existingSignIn.status === "off-duty") {
        return res.status(400).json({ message: "Security staff is already signed out" });
      }
      
      const timeOut = req.body.time_out ? new Date(req.body.time_out) : new Date();
      const updatedSignIn = await storage.signOutSecurity(id, timeOut);
      res.json(updatedSignIn);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CCTV Cameras CRUD
  app.get("/api/cctv/cameras", ensureAuthenticated, async (req, res) => {
    try {
      let cameras;
      const venueId = req.query.venueId ? parseInt(req.query.venueId as string) : undefined;
      
      if (venueId) {
        cameras = await storage.getCctvCamerasByVenue(venueId);
      } else {
        cameras = await storage.getCctvCameras();
      }
      
      res.json(cameras);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cctv/cameras/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const camera = await storage.getCctvCamera(id);
      
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      
      res.json(camera);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cctv/cameras", ensureAuthenticated, async (req, res) => {
    try {
      const cameraData = insertCctvCameraSchema.parse(req.body);
      const camera = await storage.createCctvCamera(cameraData);
      res.status(201).json(camera);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid camera data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/cctv/cameras/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingCamera = await storage.getCctvCamera(id);
      
      if (!existingCamera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      
      // Validate partial camera data
      const cameraData = insertCctvCameraSchema.partial().parse(req.body);
      const updatedCamera = await storage.updateCctvCamera(id, cameraData);
      res.json(updatedCamera);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid camera data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cctv/cameras/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCctvCamera(id);
      
      if (!success) {
        return res.status(404).json({ message: "Camera not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // CCTV Checks CRUD
  app.get("/api/cctv/checks", ensureAuthenticated, async (req, res) => {
    try {
      let checks;
      const venueId = req.query.venueId ? parseInt(req.query.venueId as string) : undefined;
      const cameraId = req.query.cameraId ? parseInt(req.query.cameraId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (venueId && limit) {
        checks = await storage.getRecentCctvChecks(venueId, limit);
      } else if (venueId) {
        checks = await storage.getCctvChecksByVenue(venueId);
      } else if (cameraId) {
        checks = await storage.getCctvChecksByCamera(cameraId);
      } else {
        checks = await storage.getCctvChecks();
      }
      
      res.json(checks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cctv/checks/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const check = await storage.getCctvCheck(id);
      
      if (!check) {
        return res.status(404).json({ message: "Check record not found" });
      }
      
      res.json(check);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cctv/checks", ensureAuthenticated, async (req, res) => {
    try {
      const checkData = insertCctvCheckSchema.parse(req.body);
      const check = await storage.createCctvCheck(checkData);
      res.status(201).json(check);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid check data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Resolve CCTV issue
  app.post("/api/cctv/checks/:id/resolve", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const check = await storage.getCctvCheck(id);
      
      if (!check) {
        return res.status(404).json({ message: "Check record not found" });
      }
      
      if (check.resolved) {
        return res.status(400).json({ message: "Issue already resolved" });
      }
      
      const actionTaken = req.body.action_taken;
      if (!actionTaken) {
        return res.status(400).json({ message: "Action taken is required" });
      }
      
      const resolvedCheck = await storage.resolveCctvIssue(id, actionTaken);
      res.json(resolvedCheck);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Shift Schedules CRUD
  app.get("/api/shift-schedules", ensureAuthenticated, async (req, res) => {
    try {
      let schedules;
      const venueId = req.query.venueId ? parseInt(req.query.venueId as string) : undefined;
      
      if (venueId) {
        schedules = await storage.getShiftSchedulesByVenue(venueId);
      } else {
        schedules = await storage.getShiftSchedules();
      }
      
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/shift-schedules/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.getShiftSchedule(id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Shift schedule not found" });
      }
      
      res.json(schedule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/shift-schedules", ensureAuthenticated, async (req, res) => {
    try {
      const scheduleData = insertShiftScheduleSchema.parse(req.body);
      const schedule = await storage.createShiftSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shift schedule data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/shift-schedules/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingSchedule = await storage.getShiftSchedule(id);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: "Shift schedule not found" });
      }
      
      // Validate partial schedule data
      const scheduleData = insertShiftScheduleSchema.partial().parse(req.body);
      const updatedSchedule = await storage.updateShiftSchedule(id, scheduleData);
      res.json(updatedSchedule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shift schedule data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/shift-schedules/:id", ensureAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteShiftSchedule(id);
      
      if (!success) {
        return res.status(404).json({ message: "Shift schedule not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", ensureAuthenticated, async (req, res) => {
    try {
      const venues = await storage.getVenues();
      const incidents = await storage.getIncidents();
      const activeSecuritySignIns = await storage.getActiveSecuritySignIns();
      const allSecuritySignIns = await storage.getSecuritySignIns();
      const cameras = await storage.getCctvCameras();
      
      // Calculate stats
      const totalIncidents = incidents.length;
      const totalSignIns = allSecuritySignIns.length;
      const activeVenues = venues.filter(v => v.status === "open").length;
      const totalCameras = cameras.length;
      
      // Recent incidents (last 10)
      const recentIncidents = [...incidents]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      
      // Active security sign-ins
      const activeSignIns = activeSecuritySignIns
        .sort((a, b) => new Date(b.time_in).getTime() - new Date(a.time_in).getTime());
      
      res.json({
        totalIncidents,
        totalSignIns,
        activeVenues,
        totalVenues: venues.length,
        totalCameras,
        recentIncidents,
        activeSignIns,
        venues
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User Management
  app.get("/api/users", ensureAuthenticated, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const users = await storage.getUsers();
      // Don't send passwords in response
      const sanitizedUsers = users.map(user => {
        if (user && user.password) {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        return user;
      });
      res.json(sanitizedUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/:id", ensureAuthenticated, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const existingUser = await storage.getUser(id);
      
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate role data
      const { role } = req.body;
      if (!role || !['admin', 'manager', 'security'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be 'admin', 'manager', or 'security'" });
      }
      
      const updatedUser = await storage.updateUser(id, { role });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id", ensureAuthenticated, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      
      // Prevent deleting self
      if (id === req.user?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Document upload routes
  app.post("/api/documents/upload", ensureAuthenticated, documentUpload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Ensure user is authenticated
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Get the document type from the request
      const documentType = req.body.documentType;
      if (!documentType || !['security_license', 'rsa_certificate'].includes(documentType)) {
        return res.status(400).json({ 
          message: "Invalid document type. Must be 'security_license' or 'rsa_certificate'" 
        });
      }
      
      // Validate document type against user role
      const userRole = req.user?.role;
      if ((userRole === 'security' && documentType !== 'security_license') || 
          (userRole === 'staff' && documentType !== 'rsa_certificate')) {
        return res.status(400).json({ 
          message: `Invalid document type for ${userRole} role. Security staff must upload 'security_license', venue staff must upload 'rsa_certificate'` 
        });
      }
      
      // Get the user from the database
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user with the document path and type
      // Store just the filename instead of the full path for security
      const documentPath = `/uploads/${req.file.filename}`;
      const updatedUser = await storage.updateUser(userId, {
        document_path: documentPath,
        document_type: documentType,
        document_verified: false, // Document needs to be verified by an admin
      });
      
      // Return the updated user without the password
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ 
          message: "Document uploaded successfully",
          user: userWithoutPassword
        });
      } else {
        res.status(500).json({ message: "Failed to update user with document information" });
      }
    } catch (error: any) {
      console.error("Document upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Document verification route (admin only)
  app.post("/api/documents/verify/:userId", ensureAuthenticated, async (req, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const userId = parseInt(req.params.userId);
      const { verified } = req.body;
      
      if (typeof verified !== 'boolean') {
        return res.status(400).json({ message: "Invalid request: 'verified' field must be a boolean" });
      }
      
      // Get the user from the database
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the document verification status
      const updatedUser = await storage.updateUser(userId, {
        document_verified: verified,
      });
      
      // Return the updated user without the password
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ 
          message: `Document ${verified ? 'verified' : 'rejected'} successfully`,
          user: userWithoutPassword
        });
      } else {
        res.status(500).json({ message: "Failed to update document verification status" });
      }
    } catch (error: any) {
      console.error("Document verification error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Serve uploaded documents (with authentication)
  app.get("/api/documents/:filename", ensureAuthenticated, (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Send the file
      res.sendFile(filePath);
    } catch (error: any) {
      console.error("Document access error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
