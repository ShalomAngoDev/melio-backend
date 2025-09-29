import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const statuses = ['NOUVEAU', 'EN_COURS', 'TRAITE'] as const;

const sampleContents = [
  "Un élève de ma classe se fait embêter à la récréation",
  "J'ai vu des insultes écrites sur les murs des toilettes",
  "Quelqu'un a volé mon goûter dans mon casier",
  "Des élèves plus âgés nous empêchent de jouer au foot",
  "On se moque de moi à cause de mes lunettes",
  "Il y a des bagarres dans la cour de récréation",
  "Un élève a été poussé dans les escaliers",
  "On m'a pris mon argent de poche de force",
  "Des élèves font des commentaires méchants sur mon physique",
  "Il y a des graffitis insultants sur mon casier",
  "Un élève a cassé mes affaires volontairement",
  "On se moque de mon accent en classe",
  "Des élèves m'empêchent de manger à la cantine",
  "Il y a des menaces écrites dans mon cahier",
  "Un élève a filmé une bagarre et l'a mise en ligne",
  "On m'exclut des jeux à la récréation",
  "Des élèves plus âgés nous font peur",
  "Il y a des rumeurs fausses qui circulent sur moi",
  "Un élève a volé mes devoirs",
  "On se moque de mes notes en classe",
  "Des élèves m'empêchent d'aller aux toilettes",
  "Il y a des insultes sur les réseaux sociaux",
  "Un élève a cassé mon téléphone",
  "On me pousse dans les couloirs",
  "Des élèves m'ont enfermé dans les toilettes",
  "Il y a des menaces de mort écrites",
  "Un élève a volé mes chaussures de sport",
  "On se moque de ma famille",
  "Des élèves m'empêchent de rentrer chez moi",
  "Il y a des photos de moi modifiées qui circulent",
  "Un élève a menacé de me frapper",
  "On m'a volé mon vélo",
  "Des élèves m'ont jeté de la nourriture dessus",
  "Il y a des insultes racistes écrites",
  "Un élève a cassé mes lunettes",
  "On me traite de tous les noms",
  "Des élèves m'ont poussé dans la boue",
  "Il y a des menaces de représailles",
  "Un élève a volé mon argent de cantine",
  "On se moque de mes vêtements"
];

const studentNames = [
  "Lucas", "Emma", "Hugo", "Léa", "Gabriel", "Chloé", "Raphaël", "Manon", "Louis", "Camille",
  "Arthur", "Sarah", "Nathan", "Lola", "Ethan", "Clara", "Liam", "Inès", "Noah", "Jade",
  "Adam", "Zoé", "Léo", "Léna", "Mael", "Rose", "Gabin", "Alice", "Tom", "Anna",
  "Paul", "Lina", "Antoine", "Eva", "Maxime", "Luna", "Alexandre", "Mia", "Théo", "Lily"
];

async function createFakeReports() {
  try {
    // Récupérer une école existante
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('Aucune école trouvée. Veuillez d\'abord créer une école.');
      return;
    }

    console.log(`Création de 40 signalements fictifs pour l'école: ${school.name}`);

    // Récupérer quelques étudiants existants
    const students = await prisma.student.findMany({
      where: { schoolId: school.id },
      take: 20
    });

    const reports = [];

    for (let i = 0; i < 40; i++) {
      const isAnonymous = Math.random() < 0.3; // 30% de signalements anonymes
      const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const content = sampleContents[Math.floor(Math.random() * sampleContents.length)];
      
      // Pour les signalements non anonymes, utiliser un étudiant existant ou null
      let studentId = null;
      if (!isAnonymous && students.length > 0) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        studentId = randomStudent.id;
      }

      // Créer des dates récentes (derniers 30 jours)
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const report = {
        schoolId: school.id,
        studentId: studentId,
        content: content,
        urgency: urgency,
        anonymous: isAnonymous,
        status: status,
        createdAt: createdAt,
        updatedAt: createdAt
      };

      reports.push(report);
    }

    // Insérer tous les signalements
    await prisma.report.createMany({
      data: reports
    });

    console.log(`✅ 40 signalements fictifs créés avec succès !`);
    console.log(`   - École: ${school.name} (${school.code})`);
    console.log(`   - Signalements anonymes: ${reports.filter(r => r.anonymous).length}`);
    console.log(`   - Signalements identifiés: ${reports.filter(r => !r.anonymous).length}`);
    console.log(`   - Répartition par statut:`);
    console.log(`     * NOUVEAU: ${reports.filter(r => r.status === 'NOUVEAU').length}`);
    console.log(`     * EN_COURS: ${reports.filter(r => r.status === 'EN_COURS').length}`);
    console.log(`     * TRAITE: ${reports.filter(r => r.status === 'TRAITE').length}`);
    console.log(`   - Répartition par urgence:`);
    console.log(`     * LOW: ${reports.filter(r => r.urgency === 'LOW').length}`);
    console.log(`     * MEDIUM: ${reports.filter(r => r.urgency === 'MEDIUM').length}`);
    console.log(`     * HIGH: ${reports.filter(r => r.urgency === 'HIGH').length}`);
    console.log(`     * CRITICAL: ${reports.filter(r => r.urgency === 'CRITICAL').length}`);

  } catch (error) {
    console.error('Erreur lors de la création des signalements fictifs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFakeReports();


