-- Migration pour corriger les noms de tables
-- Cette migration doit être exécutée sur Railway PostgreSQL

-- Supprimer les anciennes tables si elles existent (avec les mauvais noms)
DROP TABLE IF EXISTS "Alert" CASCADE;
DROP TABLE IF EXISTS "Report" CASCADE;
DROP TABLE IF EXISTS "AlertComment" CASCADE;
DROP TABLE IF EXISTS "JournalEntry" CASCADE;
DROP TABLE IF EXISTS "ChatbotMessage" CASCADE;
DROP TABLE IF EXISTS "ChatMessage" CASCADE;
DROP TABLE IF EXISTS "Student" CASCADE;
DROP TABLE IF EXISTS "AgentUser" CASCADE;
DROP TABLE IF EXISTS "AdminUser" CASCADE;
DROP TABLE IF EXISTS "School" CASCADE;

-- Supprimer les anciens ENUMs
DROP TYPE IF EXISTS "SchoolLevel";
DROP TYPE IF EXISTS "SchoolStatus";
DROP TYPE IF EXISTS "UserRole";
DROP TYPE IF EXISTS "UserStatus";
DROP TYPE IF EXISTS "AlertStatus";
DROP TYPE IF EXISTS "RiskLevel";
DROP TYPE IF EXISTS "ReportStatus";
DROP TYPE IF EXISTS "ReportUrgency";
DROP TYPE IF EXISTS "NotificationType";
DROP TYPE IF EXISTS "NotificationStatus";

-- Créer les nouvelles tables avec les bons noms et structure
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'FR',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "level" TEXT,
    "uaiCode" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "idKey" TEXT NOT NULL,
    "idKeyVer" INTEGER NOT NULL DEFAULT 1,
    "settings" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "sex" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "parentName" TEXT,
    "parentPhone" TEXT NOT NULL,
    "parentEmail" TEXT,
    "uniqueId" TEXT NOT NULL,
    "uniqueIdVer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_users" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ROLE_AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ROLE_ADMIN_MELIO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiRiskScore" INTEGER,
    "aiRiskLevel" TEXT,
    "aiSummary" TEXT,
    "aiAdvice" TEXT,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'JOURNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riskLevel" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "childMood" TEXT NOT NULL,
    "aiSummary" TEXT NOT NULL,
    "aiAdvice" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOUVELLE',

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alert_comments" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "oldStatus" TEXT,
    "newStatus" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chatbot_messages" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedTo" TEXT,

    CONSTRAINT "chatbot_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT,
    "content" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NOUVEAU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- Créer les index
CREATE UNIQUE INDEX "schools_code_key" ON "schools"("code");
CREATE UNIQUE INDEX "schools_uaiCode_key" ON "schools"("uaiCode");
CREATE UNIQUE INDEX "agent_users_email_key" ON "agent_users"("email");
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");
CREATE UNIQUE INDEX "students_schoolId_uniqueId_key" ON "students"("schoolId", "uniqueId");
CREATE INDEX "students_schoolId_className_idx" ON "students"("schoolId", "className");
CREATE INDEX "journal_entries_studentId_createdAt_idx" ON "journal_entries"("studentId", "createdAt");
CREATE INDEX "alerts_schoolId_status_createdAt_idx" ON "alerts"("schoolId", "status", "createdAt");
CREATE INDEX "alert_comments_alertId_createdAt_idx" ON "alert_comments"("alertId", "createdAt");
CREATE INDEX "chatbot_messages_studentId_createdAt_idx" ON "chatbot_messages"("studentId", "createdAt");
CREATE INDEX "chat_messages_studentId_createdAt_idx" ON "chat_messages"("studentId", "createdAt");
CREATE INDEX "reports_schoolId_status_idx" ON "reports"("schoolId", "status");
CREATE INDEX "reports_studentId_createdAt_idx" ON "reports"("studentId", "createdAt");

-- Ajouter les contraintes de clés étrangères
ALTER TABLE "students" ADD CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agent_users" ADD CONSTRAINT "agent_users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "alert_comments" ADD CONSTRAINT "alert_comments_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;






