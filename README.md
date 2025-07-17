
# Parent Hostel Pass Management System

A modern full-stack web application for managing parent visits to college hostels, featuring a seamless QR code-based entry/exit workflow, real-time approvals, and a unified monorepo using Next.js API routes (no separate backend server required).


## Features

### 🏠 Parent Portal
- Register visit requests for parents
- Instantly generate QR codes for each request
- Track visit status, scan history, and approvals
- View and delete visit requests

### 🔒 Security Portal
- Scan QR codes for entry and exit (auto-detects action)
- Entry allowed before approval, exit only after warden approval
- Real-time verification and error feedback
- View recent and full scan history

### 👮 Warden Portal
- Approve or reject visit requests after entry scan
- Monitor all hostel visit activity
- View visit and scan history
- Consistent, modern UI across all portals


## Tech Stack

- **Next.js 14** (App Router, API Routes)
- **TypeScript**
- **TailwindCSS**
- **Prisma ORM** (with SQLite for dev)
- **JWT** authentication
- **bcryptjs** for password hashing
- **QRCode** for QR code generation
- **Lucide React** for icons
- **Axios** for HTTP requests

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git


### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd parent_transport_management_system
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   # (Optional) Seed data if a seed script is provided
   ```


### Running the Application

Just start the Next.js app (API and frontend are unified):
```bash
npm run dev
```
The app will run on http://localhost:3000

## Demo Credentials

Use these credentials to test the application:

- **Parent**: parent@example.com / parent123
- **Security**: security@example.com / security123
- **Warden**: warden@example.com / warden123


## Workflow

1. **Parent Registration**: Parent creates a visit request for a student
2. **Entry Scan**: Security scans QR code for entry (no approval needed)
3. **Warden Approval**: Warden reviews and approves/rejects after entry
4. **Exit Scan**: Security scans QR code for exit (approval required)
5. **Tracking**: All actions and scans are tracked and visible in the portals


## Project Structure

```
parent_transport_management_system/
├── src/                # Next.js app (frontend + API routes)
│   ├── app/            # App router pages & API endpoints
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   └── lib/            # Utilities (API, Prisma, etc.)
├── prisma/             # Database schema
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Visit Requests
- `POST /api/visits` - Create visit request
- `GET /api/visits` - Get visit requests
- `GET /api/visits/:id` - Get specific visit request
- `POST /api/visits/:id/approve` - Approve/reject request


### Scanning
- `POST /api/scan/record` - Record a scan (auto-detects entry/exit)
- `GET /api/scan/verify/:qrCode` - Verify QR code and get next action
- `GET /api/scan/logs` - Get scan logs

### Students
- `GET /api/students` - Get all students
- `GET /api/students/search` - Search students
- `POST /api/students` - Create student (Warden only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes.

## Support

For support, please contact the development team.
