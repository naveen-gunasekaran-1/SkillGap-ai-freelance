-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Candidate',
    "location" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "phone" TEXT,
    "avatar" TEXT,
    "skillsJson" TEXT NOT NULL DEFAULT '[]',
    "skillLevelsJson" TEXT NOT NULL DEFAULT '[]',
    "educationJson" TEXT NOT NULL DEFAULT '[]',
    "experienceJson" TEXT NOT NULL DEFAULT '[]',
    "internshipsJson" TEXT NOT NULL DEFAULT '[]',
    "projectsJson" TEXT NOT NULL DEFAULT '[]',
    "linksJson" TEXT NOT NULL DEFAULT '[]',
    "resumeUrl" TEXT,
    "resumeStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "resumeVerifiedAt" DATETIME,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "skillsVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,
    CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("avatar", "companyId", "createdAt", "email", "id", "name", "passwordHash", "role", "skillsJson") SELECT "avatar", "companyId", "createdAt", "email", "id", "name", "passwordHash", "role", "skillsJson" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
