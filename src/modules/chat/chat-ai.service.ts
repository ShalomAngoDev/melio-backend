import { Injectable, Logger } from '@nestjs/common';

export interface ChatResponse {
  content: string;
  resourceId?: string;
  category?: string; // Catégorie détectée pour le fallback
}

@Injectable()
export class ChatAIService {
  private readonly logger = new Logger(ChatAIService.name);

  // Mots-clés pour détecter les émotions et situations
  private readonly emotionKeywords = {
    fear: [
      'peur',
      'peur',
      'effrayé',
      'effrayée',
      'terrifié',
      'terrifiée',
      'anxiété',
      'anxieux',
      'anxieuse',
      'stress',
      'stressé',
      'stressée',
    ],
    sadness: [
      'triste',
      'tristesse',
      'pleurer',
      'pleure',
      'déprimé',
      'déprimée',
      'malheureux',
      'malheureuse',
      'désespéré',
      'désespérée',
    ],
    anger: [
      'colère',
      'énervé',
      'énervée',
      'fâché',
      'fâchée',
      'rage',
      'frustré',
      'frustrée',
      'furieux',
      'furieuse',
    ],
    loneliness: [
      'seul',
      'seule',
      'isolement',
      'isolé',
      'isolée',
      'personne',
      'ami',
      'amie',
      'copain',
      'copine',
    ],
    bullying: [
      'moquer',
      'moqueries',
      'insulte',
      'insultes',
      'harcèlement',
      'harceler',
      'embêter',
      'embêté',
      'embêtée',
      'taquiner',
      'taquine',
    ],
    violence: [
      'frapper',
      'frapper',
      'battre',
      'battu',
      'battue',
      'violence',
      'violent',
      'violente',
      'agression',
      'agresser',
    ],
    school: [
      'école',
      'classe',
      'professeur',
      'prof',
      'cours',
      'devoir',
      'devoirs',
      'examen',
      'examens',
      'notes',
      'harcelé',
      'harceler',
      'harcèlement',
    ],
    family: ['parents', 'maman', 'papa', 'famille', 'maison', 'maison'],
  };

  // Réponses empathiques par catégorie
  private readonly responses = {
    fear: [
      "Je comprends que tu aies peur 💜 Tu n'es pas seul·e, je suis là avec toi.",
      "C'est normal d'avoir peur parfois 🌸 Veux-tu que je te montre un petit exercice pour te rassurer ?",
      "Je suis là pour t'aider à te sentir mieux 💕 Tu veux qu'on en parle ?",
    ],
    sadness: [
      "Je vois que tu es triste 💔 C'est dur, mais tu n'es pas seul·e.",
      "Je suis là pour t'écouter 💜 Veux-tu me raconter ce qui te rend triste ?",
      "Parfois on a besoin de pleurer, c'est normal 🌸 Je reste avec toi.",
    ],
    anger: [
      "Je sens que tu es en colère 😤 C'est normal d'être énervé·e parfois.",
      "La colère, c'est une émotion normale 💪 Veux-tu qu'on trouve une façon de la gérer ?",
      'Je comprends ta colère 💜 Parler peut aider à se sentir mieux.',
    ],
    loneliness: [
      "Tu n'es pas seul·e 💕 Je suis là pour toi.",
      "C'est dur de se sentir seul·e 💜 Veux-tu que je te montre comment d'autres enfants se sont fait des amis ?",
      'Je reste avec toi 🌸 On peut parler si tu veux.',
    ],
    bullying: [
      "Personne ne devrait te faire du mal 💔 Tu veux que je te montre comment d'autres enfants ont réussi à s'en sortir ?",
      "C'est courageux de m'en parler 💪 Tu n'es pas seul·e face à ça.",
      "Personne n'a le droit de te faire du mal 💜 Je peux t'aider à trouver des solutions.",
    ],
    violence: [
      "C'est très grave ce qui t'arrive 🚨 Tu veux que je te montre comment te protéger ?",
      'Personne ne doit te faire mal 💔 Il faut en parler à un adulte de confiance.',
      "C'est courageux de m'en parler 💪 Je vais t'aider à trouver de l'aide.",
    ],
    school: [
      "L'école peut être difficile parfois 📚 Veux-tu qu'on trouve des solutions ensemble ?",
      "Je comprends que l'école te pose des problèmes 💜 On peut en parler.",
      "L'école, c'est important mais parfois compliqué 🌸 Comment puis-je t'aider ?",
    ],
    family: [
      "La famille, c'est parfois compliqué 👨‍👩‍👧‍👦 Veux-tu qu'on en parle ?",
      "Je comprends que ce soit difficile à la maison 💜 Je suis là pour t'écouter.",
      'Parler de la famille peut aider 🌸 Veux-tu me raconter ?',
    ],
    general: [
      "Je suis là pour t'écouter 💜 Raconte-moi ce qui se passe.",
      "Comment puis-je t'aider aujourd'hui ? 🌸",
      'Je suis content·e que tu viennes me parler 💕',
      'Tu peux me dire tout ce qui te préoccupe 💜',
      'Je reste avec toi 🌸 Parle-moi si tu veux.',
    ],
    encouragement: [
      'Tu es courageux·se 💪',
      'Je crois en toi 💕',
      'Tu es plus fort·e que tu ne le penses 🌟',
      "Tu n'es pas seul·e 💜",
      'Je suis fier·e de toi 🌸',
    ],
    resources: [
      'Veux-tu que je te montre un petit conseil ? 💡',
      "Je peux te montrer comment d'autres enfants s'en sont sortis 📚",
      "Veux-tu voir un exercice qui peut t'aider ? 🌟",
      "Je connais des trucs qui peuvent t'aider 💪",
      'Veux-tu que je te montre une ressource utile ? 📖',
    ],
  };

  // Ressources par catégorie (TOUS les IDs sont réels de la base de données)
  private readonly resources = {
    fear: 'cmgb6s2tv00075h3p2wnewbk4', // Techniques de relaxation
    sadness: 'cmgb6s2u7000b5h3p6pu35x7w', // Reconnaître les signes de dépression
    anger: 'cmgb6s2tv00075h3p2wnewbk4', // Techniques de relaxation
    loneliness: 'cmgb6s2u7000b5h3p6pu35x7w', // Reconnaître les signes de dépression
    bullying: 'cmgb6s2sv00015h3pge3bwnb8', // Comment j'ai surmonté le harcèlement
    violence: 'cmgb6s2sv00015h3pge3bwnb8', // Comment j'ai surmonté le harcèlement
    school: 'cmgb6s2sv00015h3pge3bwnb8', // Comment j'ai surmonté le harcèlement
    family: 'cmgb6s2u7000b5h3p6pu35x7w', // Reconnaître les signes de dépression
    general: 'cmgb6s2u7000b5h3p6pu35x7w', // Reconnaître les signes de dépression
  };

  /**
   * Analyse le message de l'élève et génère une réponse appropriée
   */
  analyzeAndRespond(userMessage: string): ChatResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Détecter les catégories d'émotions/situations
    const detectedCategories = this.detectCategories(lowerMessage);

    // Sélectionner la catégorie principale
    const mainCategory = this.selectMainCategory(detectedCategories);

    // Générer la réponse
    const response = this.generateResponse(mainCategory, lowerMessage);

    this.logger.log(
      `Chat AI - Catégorie détectée: ${mainCategory}, Message: "${userMessage.substring(0, 50)}..."`,
    );

    return response;
  }

  /**
   * Détecte les catégories d'émotions dans le message
   */
  private detectCategories(message: string): string[] {
    const categories: string[] = [];

    for (const [category, keywords] of Object.entries(this.emotionKeywords)) {
      if (keywords.some((keyword) => message.includes(keyword))) {
        categories.push(category);
      }
    }

    return categories;
  }

  /**
   * Sélectionne la catégorie principale (priorité aux situations graves)
   */
  private selectMainCategory(categories: string[]): string {
    if (categories.length === 0) return 'general';

    // Priorité aux situations graves
    const priority = [
      'violence',
      'bullying',
      'fear',
      'sadness',
      'anger',
      'loneliness',
      'school',
      'family',
    ];

    for (const priorityCategory of priority) {
      if (categories.includes(priorityCategory)) {
        return priorityCategory;
      }
    }

    return categories[0];
  }

  /**
   * Génère une réponse adaptée à la catégorie
   */
  private generateResponse(category: string, message: string): ChatResponse {
    const categoryResponses = this.responses[category] || this.responses.general;
    const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];

    // Ajouter une ressource si approprié
    const shouldAddResource = this.shouldAddResource(category, message);
    const resourceId = shouldAddResource ? this.resources[category] : undefined;

    // Parfois ajouter un message d'encouragement
    const shouldAddEncouragement = Math.random() < 0.3; // 30% de chance
    const encouragement = shouldAddEncouragement
      ? this.responses.encouragement[
          Math.floor(Math.random() * this.responses.encouragement.length)
        ]
      : '';

    // Construire la réponse finale
    let finalResponse = response;
    if (encouragement) {
      finalResponse += ` ${encouragement}`;
    }

    // Ajouter une suggestion de ressource si pas déjà incluse
    if (resourceId && !finalResponse.includes('montrer')) {
      const resourceSuggestion =
        this.responses.resources[Math.floor(Math.random() * this.responses.resources.length)];
      finalResponse += ` ${resourceSuggestion}`;
    }

    return {
      content: finalResponse,
      resourceId: resourceId,
      category: category, // Inclure la catégorie pour le fallback
    };
  }

  /**
   * Détermine si une ressource doit être ajoutée
   */
  private shouldAddResource(category: string, _message: string): boolean {
    // Toujours ajouter une ressource pour les situations graves
    if (['violence', 'bullying'].includes(category)) {
      return true;
    }

    // 70% de chance pour les autres catégories
    if (['fear', 'sadness', 'anger', 'loneliness', 'school', 'family'].includes(category)) {
      return Math.random() < 0.7;
    }

    // 30% de chance pour les messages généraux
    return Math.random() < 0.3;
  }

  /**
   * Vérifie si le message est hors sujet ou inapproprié
   */
  isOffTopic(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Mots-clés hors sujet
    const offTopicKeywords = [
      'politique',
      'élection',
      'vote',
      'gouvernement',
      'sexe',
      'sexuel',
      'sexuelle',
      'adultes',
      'drogue',
      'alcool',
      'cigarette',
      'argent',
      'travail',
      'emploi',
      'religion',
      'dieu',
      'prière',
    ];

    return offTopicKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Génère une réponse de redirection pour les messages hors sujet
   */
  getOffTopicResponse(): ChatResponse {
    const responses = [
      "Je suis là pour t'aider avec l'école et tes émotions 💜 Veux-tu qu'on parle de ça ?",
      "Je préfère qu'on parle de toi et de ce qui se passe à l'école 🌸 Comment vas-tu ?",
      "Je suis spécialisé dans l'aide aux élèves 💕 Raconte-moi ce qui te préoccupe !",
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
    };
  }
}
