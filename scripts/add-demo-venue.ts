import { db } from "../server/db";
import { venues, incidents, securitySignIns, cctvCameras, cctvChecks, shiftSchedules } from "../shared/schema";

async function main() {
  console.log("Creating demo data for iDU Nightclub...");

  try {
    // Create the Venue
    const [venue] = await db.insert(venues).values({
      name: "iDU Nightclub",
      status: "open",
      address: "123 Nightlife Blvd, Downtown",
      contact: "+1 (555) 123-4567"
    }).returning();
    
    console.log("Venue created:", venue);
    
    // Create CCTV Cameras for the venue
    const camerasData = [
      {
        name: "Front Entrance Cam 1",
        type: "PTZ",
        status: "active",
        venue_id: venue.id,
        location: "Main Entrance",
        notes: "Covers the main entrance and queue area",
        created_at: new Date()
      },
      {
        name: "Main Bar Cam 2",
        type: "Fixed",
        status: "active",
        venue_id: venue.id,
        location: "Behind Main Bar",
        notes: "Monitors the bar service area",
        created_at: new Date()
      },
      {
        name: "Dance Floor Cam 3",
        type: "PTZ",
        status: "active",
        venue_id: venue.id,
        location: "Above Dance Floor",
        notes: "Full view of dance floor and DJ booth",
        created_at: new Date()
      },
      {
        name: "VIP Area Cam 4",
        type: "Fixed",
        status: "active",
        venue_id: venue.id,
        location: "VIP Section",
        notes: "Monitors exclusive VIP lounge area",
        created_at: new Date()
      }
    ];
    
    const createdCameras = await Promise.all(
      camerasData.map(camera => db.insert(cctvCameras).values(camera).returning())
    );
    
    console.log("CCTV Cameras created:", createdCameras.length);
    
    // Create Shift Schedules
    const shiftsData = [
      {
        name: "Evening Shift",
        venue_id: venue.id,
        start_time: "18:00",
        end_time: "02:00",
        active: true
      },
      {
        name: "Night Shift",
        venue_id: venue.id,
        start_time: "22:00",
        end_time: "06:00",
        active: true
      },
      {
        name: "Weekend Special",
        venue_id: venue.id,
        start_time: "20:00",
        end_time: "08:00",
        active: true
      }
    ];
    
    const createdShifts = await Promise.all(
      shiftsData.map(shift => db.insert(shiftSchedules).values(shift).returning())
    );
    
    console.log("Shift Schedules created:", createdShifts.length);
    
    // Create some sample incidents
    const incidentsData = [
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        type: "Disturbance",
        severity: "medium",
        venue_id: venue.id,
        location: "Main Bar",
        description: "Verbal altercation between patrons over a spilled drink",
        reported_by: "Mike Johnson",
        position: "Security",
        involved_parties: "Two male patrons in their 20s",
        actions_taken: "Parties separated and one escorted outside to cool off",
        witnesses: "Bartender and three other patrons"
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        type: "Medical",
        severity: "high",
        venue_id: venue.id,
        location: "Dance Floor",
        description: "Female patron collapsed - possible dehydration",
        reported_by: "Sarah Williams",
        position: "Floor Manager",
        involved_parties: "Female patron, approx 25yo",
        actions_taken: "First aid administered, paramedics called, patron transported to hospital",
        witnesses: "DJ and nearby dancers"
      },
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
        type: "Theft",
        severity: "medium",
        venue_id: venue.id,
        location: "Coat Check",
        description: "Patron reported missing phone from coat pocket",
        reported_by: "Chris Taylor",
        position: "Security Lead",
        involved_parties: "Male patron claiming theft",
        actions_taken: "Report taken, CCTV footage reviewed, police contacted",
        witnesses: "Coat check attendant"
      }
    ];
    
    const createdIncidents = await Promise.all(
      incidentsData.map(incident => db.insert(incidents).values(incident).returning())
    );
    
    console.log("Incidents created:", createdIncidents.length);
    
    // Create Security Sign-Ins
    const signInsData = [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
        venue_id: venue.id,
        position: "Door Security",
        security_name: "John Smith",
        badge_number: "SG12345",
        time_in: new Date(Date.now() - 26 * 60 * 60 * 1000), // yesterday evening
        time_out: new Date(Date.now() - 18 * 60 * 60 * 1000), // early morning today
        status: "off-duty",
        notes: "Routine shift with no incidents"
      },
      {
        date: new Date(), // today
        venue_id: venue.id,
        position: "Floor Security",
        security_name: "Alex Rodriguez",
        badge_number: "SG67890",
        time_in: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        time_out: null,
        status: "on-duty",
        notes: "Covering main floor and VIP area"
      }
    ];
    
    const createdSignIns = await Promise.all(
      signInsData.map(signIn => db.insert(securitySignIns).values(signIn).returning())
    );
    
    console.log("Security Sign-Ins created:", createdSignIns.length);
    
    // Create CCTV Checks
    const checksData = [
      {
        status: "ok",
        venue_id: venue.id,
        camera_id: createdCameras[0][0].id,
        checked_by: 1, // Admin user
        check_time: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        shift_type: "Evening",
        issue_description: null,
        action_taken: null,
        resolved: null
      },
      {
        status: "issue",
        venue_id: venue.id,
        camera_id: createdCameras[1][0].id,
        checked_by: 1, // Admin user
        check_time: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        shift_type: "Night",
        issue_description: "Poor image quality - camera lens appears dirty",
        action_taken: "Lens cleaned and focus adjusted",
        resolved: true
      },
      {
        status: "issue",
        venue_id: venue.id,
        camera_id: createdCameras[2][0].id,
        checked_by: 1, // Admin user
        check_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        shift_type: "Night",
        issue_description: "Camera feed intermittently dropping",
        action_taken: null,
        resolved: false
      }
    ];
    
    const createdChecks = await Promise.all(
      checksData.map(check => db.insert(cctvChecks).values(check).returning())
    );
    
    console.log("CCTV Checks created:", createdChecks.length);
    
    console.log("Demo data created successfully!");
  } catch (error) {
    console.error("Error creating demo data:", error);
  } finally {
    process.exit(0);
  }
}

main();