/*
  Warnings:

  - Made the column `rollNumber` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "hostelName" TEXT NOT NULL,
    "roomNumber" TEXT
);
INSERT INTO "new_Student" ("branch", "course", "hostelName", "id", "name", "rollNumber", "roomNumber", "year") SELECT "branch", "course", "hostelName", "id", "name", "rollNumber", "roomNumber", "year" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_rollNumber_key" ON "Student"("rollNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
