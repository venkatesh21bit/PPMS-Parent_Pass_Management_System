-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "hostelName" TEXT NOT NULL,
    "roomNumber" TEXT
);

-- CreateTable
CREATE TABLE "VisitRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "qrCode" TEXT NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VisitRequest_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VisitRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitRequestId" TEXT NOT NULL,
    "wardenId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "remarks" TEXT,
    "approvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Approval_visitRequestId_fkey" FOREIGN KEY ("visitRequestId") REFERENCES "VisitRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Approval_wardenId_fkey" FOREIGN KEY ("wardenId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScanLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitRequestId" TEXT NOT NULL,
    "scannedBy" TEXT NOT NULL,
    "scanType" TEXT NOT NULL,
    "location" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,
    CONSTRAINT "ScanLog_visitRequestId_fkey" FOREIGN KEY ("visitRequestId") REFERENCES "VisitRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScanLog_scannedBy_fkey" FOREIGN KEY ("scannedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "Student"("rollNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VisitRequest_qrCode_key" ON "VisitRequest"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_visitRequestId_wardenId_key" ON "Approval"("visitRequestId", "wardenId");
