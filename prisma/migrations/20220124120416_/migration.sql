-- CreateTable
CREATE TABLE "Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Telemetry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Telemetry_deviceID_fkey" FOREIGN KEY ("deviceID") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MQTTSubscriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topic" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deviceConnectionId" INTEGER,
    CONSTRAINT "MQTTSubscriptions_deviceConnectionId_fkey" FOREIGN KEY ("deviceConnectionId") REFERENCES "DeviceConnection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeviceConnection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceID" INTEGER NOT NULL,
    "typeID" INTEGER NOT NULL,
    "connectionString" TEXT,
    CONSTRAINT "DeviceConnection_deviceID_fkey" FOREIGN KEY ("deviceID") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeviceConnection_typeID_fkey" FOREIGN KEY ("typeID") REFERENCES "ConnectionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConnectionType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceConnection_deviceID_key" ON "DeviceConnection"("deviceID");
