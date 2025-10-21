import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const libraryResources = [
  {
    title: 'Comment j\'ai surmonté le harcèlement',
    type: 'testimony',
    category: 'bullying',
    description: 'Témoignage de Sarah, 16 ans, qui partage son expérience et comment elle a retrouvé confiance en elle.',
    content: 'Je m\'appelle Sarah et j\'ai 16 ans. Il y a deux ans, j\'étais victime de harcèlement à l\'école...',
    duration: '8 min',
    author: 'Sarah M.',
    rating: 4.8,
    views: 1247,
    thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: true,
    tags: ['harcèlement', 'témoignage', 'confiance', 'adolescence'],
    metadata: JSON.stringify({
      difficulty: 'beginner',
      language: 'fr',
      ageRange: '12-18'
    })
  },
  {
    title: 'Gérer ses émotions au quotidien',
    type: 'video',
    category: 'emotions',
    description: 'Techniques simples pour comprendre et gérer tes émotions, expliquées par une psychologue.',
    content: 'https://example.com/video/gerer-emotions',
    duration: '12 min',
    author: 'Dr. Claire Dubois',
    rating: 4.9,
    views: 2156,
    thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: true,
    tags: ['émotions', 'psychologie', 'gestion', 'quotidien'],
    metadata: JSON.stringify({
      difficulty: 'intermediate',
      language: 'fr',
      ageRange: '12-18',
      videoUrl: 'https://example.com/video/gerer-emotions'
    })
  },
  {
    title: 'Les vrais amis',
    type: 'book',
    category: 'friendship',
    description: 'Extrait du livre "Adolescence et amitié" - Comment reconnaître les vraies amitiés.',
    content: 'L\'amitié à l\'adolescence est un pilier fondamental de notre développement...',
    author: 'Marie Rousseau',
    rating: 4.6,
    views: 892,
    thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: false,
    tags: ['amitié', 'relations', 'adolescence', 'livre'],
    metadata: JSON.stringify({
      difficulty: 'beginner',
      language: 'fr',
      ageRange: '12-18',
      isbn: '978-2-123456-78-9'
    })
  },
  {
    title: 'Techniques de relaxation',
    type: 'article',
    category: 'emotions',
    description: '5 exercices de respiration pour gérer le stress et l\'anxiété.',
    content: 'Voici 5 techniques de relaxation que tu peux pratiquer n\'importe où...',
    duration: '5 min',
    author: 'Dr. Pierre Martin',
    rating: 4.7,
    views: 1563,
    thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: false,
    tags: ['relaxation', 'stress', 'anxiété', 'respiration'],
    metadata: JSON.stringify({
      difficulty: 'beginner',
      language: 'fr',
      ageRange: '12-18',
      exercises: 5
    })
  },
  {
    title: 'Construire sa confiance en soi',
    type: 'video',
    category: 'self-esteem',
    description: 'Exercices pratiques pour développer une image positive de soi.',
    content: 'https://example.com/video/confiance-soi',
    duration: '15 min',
    author: 'Sophie Laurent',
    rating: 4.9,
    views: 1892,
    thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: true,
    tags: ['confiance', 'estime', 'développement', 'exercices'],
    metadata: JSON.stringify({
      difficulty: 'intermediate',
      language: 'fr',
      ageRange: '12-18',
      videoUrl: 'https://example.com/video/confiance-soi'
    })
  },
  {
    title: 'Reconnaître les signes de dépression',
    type: 'article',
    category: 'help',
    description: 'Guide pour identifier les signes de dépression chez les adolescents.',
    content: 'La dépression chez les adolescents peut se manifester de différentes façons...',
    author: 'Dr. Anne Moreau',
    rating: 4.5,
    views: 2341,
    thumbnail: 'https://images.pexels.com/photos/3808904/pexels-photo-3808904.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: false,
    tags: ['dépression', 'signes', 'aide', 'santé mentale'],
    metadata: JSON.stringify({
      difficulty: 'intermediate',
      language: 'fr',
      ageRange: '12-18',
      warning: 'Contenu sensible'
    })
  },
  {
    title: 'Gérer les conflits entre amis',
    type: 'video',
    category: 'friendship',
    description: 'Techniques de communication pour résoudre les disputes entre amis.',
    content: 'https://example.com/video/conflits-amis',
    duration: '10 min',
    author: 'Thomas Bernard',
    rating: 4.4,
    views: 987,
    thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: false,
    tags: ['conflits', 'communication', 'amitié', 'résolution'],
    metadata: JSON.stringify({
      difficulty: 'beginner',
      language: 'fr',
      ageRange: '12-18',
      videoUrl: 'https://example.com/video/conflits-amis'
    })
  },
  {
    title: 'Mon parcours de reconstruction',
    type: 'testimony',
    category: 'self-esteem',
    description: 'Témoignage de Lucas sur sa reconstruction après des années de harcèlement.',
    content: 'Bonjour, je m\'appelle Lucas et j\'ai 17 ans. Pendant 3 ans, j\'ai été harcelé...',
    duration: '6 min',
    author: 'Lucas P.',
    rating: 4.8,
    views: 1456,
    thumbnail: 'https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    isFeatured: true,
    tags: ['reconstruction', 'harcèlement', 'témoignage', 'espoir'],
    metadata: JSON.stringify({
      difficulty: 'beginner',
      language: 'fr',
      ageRange: '12-18',
      triggerWarning: 'Harcèlement'
    })
  }
];

async function seedLibraryResources() {
  console.log('🌱 Seeding library resources...');

  try {
    // Récupérer la première école pour associer les ressources
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('❌ Aucune école trouvée. Veuillez d\'abord créer une école.');
      return;
    }

    // Créer les ressources de bibliothèque
    for (const resourceData of libraryResources) {
      const resource = await prisma.libraryResource.create({
        data: {
          ...resourceData,
          schoolId: school.id,
        },
      });
      console.log(`✅ Ressource créée: ${resource.title}`);
    }

    console.log(`🎉 ${libraryResources.length} ressources de bibliothèque créées avec succès !`);
  } catch (error) {
    console.error('❌ Erreur lors de la création des ressources:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  seedLibraryResources();
}

export default seedLibraryResources;
