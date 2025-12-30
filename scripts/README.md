# Migration & Testing Scripts

This directory contains scripts to help migrate and test the new hostel-based system.

## Available Scripts

### 1. **migrate-wardens-raw.ts** ✅ COMPLETED
Migrates existing `WARDEN` role users to `HOSTEL_WARDEN` with default hostel assignment.

```bash
npx tsx scripts/migrate-wardens-raw.ts
```

**Status**: Already run successfully - 1 warden account migrated to Agasthya Bhavanam

---

### 2. **create-hostel-wardens.ts**
Creates dedicated warden accounts for each of the three hostels.

```bash
npx tsx scripts/create-hostel-wardens.ts
```

**Creates accounts for:**
- Agasthya Bhavanam (agasthya.warden@college.edu)
- Vasishta Bhavanam (vasishta.warden@college.edu)
- Gautama Bhavanam (gautama.warden@college.edu)

**Default Password**: warden123 (⚠️ Change immediately after first login!)

---

### 3. **check-users.ts**
Lists all users in the database with their roles and hostel assignments.

```bash
npx tsx scripts/check-users.ts
```

**Current Users:**
- 9 total users
- 1 HOSTEL_WARDEN (Agasthya Bhavanam)
- 1 SECURITY
- 7 PARENT accounts

---

### 4. **test-features.ts**
Runs comprehensive tests for the new features.

```bash
npx tsx scripts/test-features.ts
```

**Tests:**
- ✅ Roll number validation (CB.SC.U4XXX##### format)
- ✅ Hostel filtering (passes by hostel)
- ✅ Hostel warden account validation

---

## Migration Checklist

### ✅ Completed
- [x] Updated Prisma schema (UserRole enum)
- [x] Generated Prisma client
- [x] Pushed schema changes to database
- [x] Migrated existing WARDEN → HOSTEL_WARDEN
- [x] Assigned default hostel (Agasthya Bhavanam)

### 📋 Next Steps

1. **Create additional warden accounts** (optional):
   ```bash
   npx tsx scripts/create-hostel-wardens.ts
   ```

2. **Test the application**:
   - Login as parent and create a visit request
   - Verify vehicle number is mandatory
   - Verify roll number format validation (CB.SC.U4CSE23519)
   - Select a hostel from the dropdown

3. **Test hostel portals**:
   - Login as warden: `warden@example.com` / (your password)
   - Verify you're redirected to `/hostel/agasthya`
   - Check that only Agasthya Bhavanam passes are visible
   - Create test passes for other hostels
   - Create wardens for other hostels to test filtering

4. **Verify settings removal**:
   - Check that Settings button is removed from user menu
   - Only "Sign Out" option should remain

---

## Testing the New Features

### Roll Number Validation
The form will reject invalid formats:
- ✅ Valid: `CB.SC.U4CSE23519`, `CB.SC.U4ECE12345`
- ❌ Invalid: `CB.SC.U4CS23519` (2 letters), `CB.SC.U3CSE23519` (U3 instead of U4)

### Vehicle Number
Now **mandatory** for all visit requests. Auto-converts to uppercase.

### Hostel Selection
Dropdown with three options:
- Agasthya Bhavanam
- Vasishta Bhavanam
- Gautama Bhavanam

### Hostel Portal Filtering
Each hostel portal shows only passes for their respective hostel:
- `/hostel/agasthya` - Agasthya Bhavanam passes only
- `/hostel/vasishta` - Vasishta Bhavanam passes only
- `/hostel/gautama` - Gautama Bhavanam passes only

---

## Troubleshooting

### "Value 'WARDEN' not found in enum 'UserRole'"
This means you have old WARDEN role users. Run:
```bash
npx tsx scripts/migrate-wardens-raw.ts
```

### "No HOSTEL_WARDEN accounts found"
Create warden accounts for all hostels:
```bash
npx tsx scripts/create-hostel-wardens.ts
```

### Hostel portal shows no passes
1. Check that students have hostel assignments
2. Verify the warden's `hostelName` field matches the student's hostel
3. Check that visits are being filtered correctly by hostel

---

## Database Schema Changes

### User Model
```prisma
model User {
  // ... existing fields
  hostelName String?  // NEW: For hostel wardens
}

enum UserRole {
  PARENT
  SECURITY
  HOSTEL_WARDEN  // Changed from WARDEN
}
```

No changes to Student or VisitRequest models - they already had hostelName field.
