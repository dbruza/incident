# NightGuard Application Architecture

## Overview

NightGuard is a full-stack web application designed for venue security management. The system allows security personnel to sign in/out of venues, report incidents, manage CCTV checks, and perform various security-related tasks. It features role-based access control with different permission levels (admin, manager, security, staff).

The application follows a client-server architecture:
- Frontend: React with TypeScript using a component-based architecture
- Backend: Node.js with Express
- Database: PostgreSQL with Drizzle ORM
- Authentication: Session-based with Passport.js

## System Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │ ◄─────► │  Express Server │ ◄─────► │   PostgreSQL    │
│    (Client)     │   API   │    (Server)     │  Drizzle │    Database     │
│                 │         │                 │   ORM    │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Frontend Architecture

The React frontend is organized around a component-based architecture with:

- **UI Components**: Reusable UI elements built using Radix UI primitives
- **Page Components**: Full page views that compose UI components
- **Hooks**: Custom React hooks for state management and business logic
- **Routing**: Uses Wouter for client-side routing
- **API Communication**: TanStack Query for data fetching, caching, and state management
- **Styling**: Tailwind CSS for styling with a design system defined in the theme

### Backend Architecture

The Express backend is structured with:

- **API Routes**: RESTful endpoints for all application features
- **Authentication**: Session-based auth with Passport.js
- **Database Access**: Abstracted through a storage interface
- **Middleware**: For request logging, error handling, and authentication

### Database Schema

The database uses PostgreSQL with Drizzle ORM for type-safe data access. Key entities include:

- **Users**: System users with roles (admin, manager, security, staff)
- **Venues**: Locations that are being monitored
- **Incidents**: Security incidents that occur at venues
- **Security Sign-Ins**: Track when security personnel are on duty
- **CCTV Cameras**: Information about surveillance cameras
- **CCTV Checks**: Records of camera inspections
- **Shift Schedules**: Define work schedules for venues

## Key Components

### Frontend Components

1. **Authentication System**
   - Login/registration functionality
   - Session management
   - Role-based access control

2. **Dashboard**
   - Overview of security status
   - Recent incidents
   - Active venues
   - Security personnel currently on duty

3. **Incident Management**
   - Creating and tracking incidents
   - Approval workflow for incidents
   - Filtering and searching capabilities

4. **Security Sign-In System**
   - Track security personnel on/off duty status
   - Sign-in verification
   - Daily security code generation

5. **CCTV Register**
   - Camera management
   - Regular check scheduling and recording
   - Issue reporting and tracking

6. **Venue Management**
   - Adding and editing venues
   - Opening/closing venues
   - Assigning security personnel

7. **User Management**
   - Create and manage users
   - Role assignment
   - Document verification for security personnel

### Backend Components

1. **API Layer**
   - RESTful endpoints for all frontend features
   - Request validation
   - Response formatting

2. **Authentication Service**
   - User authentication with Passport.js
   - Password hashing with crypto
   - Session management

3. **Database Access Layer**
   - Abstracted through storage interface
   - Drizzle ORM for type-safe database access
   - Connection pooling with Neon Serverless

4. **File Upload Service**
   - Multer for document upload (security licenses, etc.)
   - File storage and retrieval

5. **Audit & Logging System**
   - Request logging
   - Activity tracking
   - Error handling

## Data Flow

### Authentication Flow

1. User submits credentials (username/password)
2. Server validates credentials against stored password hash
3. On success, a session is created and stored
4. Session ID is sent to client as a cookie
5. Subsequent requests include this cookie for authentication

### Incident Reporting Flow

1. Security personnel creates an incident report
2. Report is stored with 'pending' status
3. Manager receives notification of pending incident
4. Manager reviews and approves/rejects the incident
5. Security personnel can view the status of their submitted incidents

### Security Sign-In Flow

1. Security personnel initiates sign-in
2. System validates their credentials and role
3. Record is created marking them as on duty at a specific venue
4. When shift ends, they sign out
5. System tracks total hours and maintains audit trail

### CCTV Check Flow

1. Security personnel performs camera check
2. Records status of each camera (working/issues)
3. If issues found, details are recorded
4. Reports are generated for cameras requiring maintenance
5. Issues are tracked until resolved

## External Dependencies

### Frontend Dependencies

- **React**: UI library
- **TanStack Query**: Data fetching and state management
- **Radix UI**: Accessible UI component primitives
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Component system built on Radix and Tailwind
- **Wouter**: Lightweight routing
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Lucide Icons**: Icon set

### Backend Dependencies

- **Express**: Web framework
- **Passport.js**: Authentication middleware
- **Drizzle ORM**: Type-safe database access
- **Neon Serverless**: PostgreSQL database driver
- **Multer**: File upload handling
- **Express Session**: Session management
- **TypeScript**: Type safety
- **SendGrid**: Email services
- **ws**: WebSocket support for Neon database

## Deployment Strategy

The application is configured for deployment on the Replit platform with:

- **Build Process**: Vite for frontend bundling, esbuild for server bundling
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Environment Variables**: Used for database connection, session secrets, etc.
- **Static Assets**: Served from the 'dist/public' directory
- **Deployment Target**: "autoscale" in the Replit configuration

The deployment process includes:
1. Building the frontend with Vite
2. Bundling the server with esbuild
3. Serving static assets and API from the same origin
4. Connecting to the database using environment variables

## Security Considerations

1. **Authentication**: Password hashing using scrypt with salt
2. **Authorization**: Role-based access control system
3. **Session Management**: Secure cookie-based sessions
4. **Input Validation**: Zod schema validation for all inputs
5. **Document Verification**: Security personnel documents stored and verified
6. **Audit Trail**: Actions logged for accountability

## Development Workflow

The application supports the following development workflows:

1. **Local Development**: `npm run dev` starts both server and client with hot reloading
2. **Type Checking**: `npm run check` for TypeScript type validation
3. **Database Schema Updates**: `npm run db:push` to update the database schema
4. **Production Build**: `npm run build` creates optimized production bundles
5. **Production Start**: `npm run start` runs the production build