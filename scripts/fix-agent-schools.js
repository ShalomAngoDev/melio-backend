#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAgentSchools() {
  try {
    console.log('🔧 Fixing agent_schools table...');
    
    // Vérifier si la table existe
    try {
      await prisma.$executeRaw`SELECT 1 FROM agent_schools LIMIT 1`;
      console.log('✅ Table agent_schools already exists');
    } catch (error) {
      console.log('📦 Creating agent_schools table...');
      
      // Créer la table manuellement
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS agent_schools (
          agent_id TEXT NOT NULL,
          school_id TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          PRIMARY KEY (agent_id, school_id),
          FOREIGN KEY (agent_id) REFERENCES "AgentUser"("id") ON DELETE CASCADE,
          FOREIGN KEY (school_id) REFERENCES "School"("id") ON DELETE CASCADE
        )
      `;
      
      console.log('✅ Table agent_schools created');
    }
    
    // Vérifier les agents et écoles existants
    const agents = await prisma.agentUser.findMany();
    const schools = await prisma.school.findMany();
    
    console.log(`📊 Found ${agents.length} agents and ${schools.length} schools`);
    
    // Créer les relations agent-école
    for (const agent of agents) {
      for (const school of schools) {
        try {
          await prisma.agentSchool.create({
            data: {
              agentId: agent.id,
              schoolId: school.id,
            },
          });
          console.log(`✅ Linked agent ${agent.email} to school ${school.name}`);
        } catch (error) {
          if (error.code === 'P2002') {
            // Relation déjà existante
            console.log(`⚠️ Relation already exists: ${agent.email} -> ${school.name}`);
          } else {
            console.error(`❌ Error linking ${agent.email} to ${school.name}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Agent-schools relations created successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing agent_schools:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAgentSchools()
  .then(() => {
    console.log('🎉 Fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  });
