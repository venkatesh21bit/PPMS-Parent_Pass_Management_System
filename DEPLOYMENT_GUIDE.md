# Deployment Guide for Vercel

## Current Issue
The application is failing on Vercel because environment variables are not configured.

## Required Environment Variables

You **MUST** add these to your Vercel project:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select project: `ppms-parent-pass-management-system`
- Go to: **Settings → Environment Variables**

### 2. Add These Variables

#### JWT_SECRET (Required)
```
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production-make-it-very-long-and-random
```
**Important**: Generate a strong random string for production! Use something like:
```bash
openssl rand -base64 32
```

#### DATABASE_URL (Required)
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```
Replace with your actual MongoDB connection string.

#### NEXT_PUBLIC_API_URL (Optional)
```
NEXT_PUBLIC_API_URL=/api
```
This is already in vercel.json, but you can add it as an env var too.

### 3. After Adding Variables
- Click "Save"
- Vercel will automatically redeploy
- Wait for deployment to complete
- Test the application

## Application Workflow

### 1. Parent Flow
1. **Register/Login** as PARENT
2. **Create Visit Request**:
   - Select student
   - Choose date/time
   - Add vehicle number (optional)
   - Add purpose (optional)
3. **Receive QR Code** after creation
4. **Show QR Code** to security at entrance

### 2. Security Flow
1. **Login** as SECURITY
2. **Scan QR Code** when parent arrives
3. System automatically detects:
   - If PENDING → Records ENTRY scan
   - If INSIDE → Records EXIT scan
4. **View Scan Logs** in dashboard

### 3. Hostel Warden Flow
1. **Login** as HOSTEL_WARDEN (e.g., Agasthya warden)
2. **View Pending Visits**:
   - See all students who have been scanned for ENTRY
   - Shows students from their hostel only
3. **Approve/Reject** visits:
   - Approve: Student can exit later
   - Reject: Visit is denied
4. **View Visit History** for their hostel

## User Roles

### PARENT
- Create visit requests
- View their own visit requests
- See QR codes

### SECURITY
- Scan QR codes at entrance
- View all scan logs
- Record entry/exit

### HOSTEL_WARDEN
- Approve/reject visit requests
- View pending scanned visits (INSIDE status)
- Limited to their assigned hostel
- Cannot approve visits for other hostels

## Complete Visit Lifecycle

```
1. PENDING (Created by parent)
   ↓ [Security scans QR code]
2. INSIDE (Entry recorded, waiting for warden approval)
   ↓ [Warden approves]
3. APPROVED (Ready for exit)
   ↓ [Security scans QR code for exit]
4. OUT (Visit completed)
```

## Hostel Names
The system supports three hostels:
- Agasthya Bhavanam
- Vasishta Bhavanam
- Gautama Bhavanam

## Current Users in Database
Based on the script output:
1. warden@example.com - Agasthya Bhavanam
2. agasthya.warden@college.edu - Agasthya Bhavanam
3. vasishta.warden@college.edu - Vasishta Bhavanam
4. gautama.warden@college.edu - Gautama Bhavanam

## Testing the Application

### After Deployment:
1. **Test Login**: Try logging in with a warden account
2. **Test Parent Flow**: Create a visit request
3. **Test Security Flow**: Scan the QR code
4. **Test Warden Flow**: Approve the pending visit

## Troubleshooting

### 500 Internal Server Error
- **Check**: Environment variables are set in Vercel
- **Check**: MongoDB connection string is correct
- **Check**: Prisma Client is generated (automatic via postinstall)

### Login Fails
- **Issue**: JWT_SECRET not set
- **Fix**: Add JWT_SECRET to Vercel environment variables

### Cannot Approve Visits
- **Issue**: User needs to logout and login again after fixes
- **Fix**: Clear browser storage and login again

### Visits Endpoint Returns 500
- **Issue**: DATABASE_URL not set or incorrect
- **Fix**: Verify MongoDB connection string in Vercel

## Next Steps

1. ✅ Code fixes are complete
2. ⚠️ **ACTION REQUIRED**: Configure environment variables on Vercel
3. ⚠️ **ACTION REQUIRED**: Redeploy the application
4. ⚠️ **ACTION REQUIRED**: Test the complete workflow
5. ⚠️ **ACTION REQUIRED**: All users must logout and login again to get new JWT tokens

## Security Notes

- Never commit .env files to Git
- Use strong, random JWT_SECRET in production
- MongoDB connection strings should use strong passwords
- Consider using Vercel's environment variable encryption
