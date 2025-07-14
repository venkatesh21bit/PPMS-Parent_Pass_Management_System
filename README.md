# Parent Transport Management System

A comprehensive full-stack application for managing parent visits to college hostels with QR code scanning and approval workflow.

## Features

### 🏠 Parent Portal
- Register visit requests with student details
- Generate QR codes for approved visits
- Track visit status and history
- Vehicle registration support

### 🔒 Security Portal
- Scan QR codes for entry/exit
- Real-time visit verification
- Timestamp tracking
- Invalid code detection

### 👮 Warden Portal
- Approve/reject visit requests
- Monitor hostel-specific visits
- Real-time notifications
- Visit history and analytics

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### Backend
- **Express.js** - Node.js framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database management
- **SQLite** - Database (development)
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **QRCode** - QR code generation

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

2. **Install frontend dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up the database**
   ```bash
   # In the backend directory
   npx prisma generate
   npx prisma migrate dev --name init
   npx ts-node src/seed.ts
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000

## Demo Credentials

Use these credentials to test the application:

- **Parent**: parent@example.com / parent123
- **Security**: security@example.com / security123
- **Warden**: warden@example.com / warden123

## Workflow

1. **Parent Registration**: Parents create visit requests with student details
2. **QR Code Generation**: System generates unique QR codes for requests
3. **Warden Approval**: Wardens review and approve/reject requests
4. **Security Scanning**: Security scans QR codes for entry/exit
5. **Real-time Updates**: All parties receive live notifications

## Project Structure

```
parent_transport_management_system/
├── src/                          # Frontend (Next.js)
│   ├── app/                      # App router pages
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   └── lib/                      # Utilities
├── backend/                      # Backend (Express.js)
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   ├── controllers/         # Route controllers
│   │   └── utils/               # Utilities
│   └── prisma/                  # Database schema
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
- `POST /api/scan/scan` - Scan QR code
- `GET /api/scan/verify/:qrCode` - Verify QR code
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
