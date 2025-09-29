import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.auditLog.deleteMany();
  await prisma.alertStatusHistory.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.report.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.parentContact.deleteMany();
  await prisma.student.deleteMany();
  await prisma.agentUser.deleteMany();
  await prisma.school.deleteMany();
});

export { prisma };
