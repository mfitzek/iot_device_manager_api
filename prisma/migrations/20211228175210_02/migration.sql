/*
  Warnings:

  - Added the required column `typeID` to the `DeviceConnection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ConnectionType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeviceConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceID" INTEGER NOT NULL,
    "typeID" INTEGER NOT NULL,
    "connectionString" TEXT NOT NULL,
    CONSTRAINT "DeviceConnection_deviceID_fkey" FOREIGN KEY ("deviceID") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeviceConnection_typeID_fkey" FOREIGN KEY ("typeID") REFERENCES "ConnectionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DeviceConnection" ("connectionString", "deviceID", "id") SELECT "connectionString", "deviceID", "id" FROM "DeviceConnection";
DROP TABLE "DeviceConnection";
ALTER TABLE "new_DeviceConnection" RENAME TO "DeviceConnection";
CREATE UNIQUE INDEX "DeviceConnection_deviceID_key" ON "DeviceConnection"("deviceID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
