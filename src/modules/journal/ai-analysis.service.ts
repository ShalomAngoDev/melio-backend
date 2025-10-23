import { Injectable, Logger } from '@nestjs/common';

export interface AIAnalysisResult {
  riskScore: number;
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  summary: string;
  advice: string;
  dominantCategory?: string;
}

export interface RecurrenceData {
  category: string;
  days: number;
}

type Mood = 'TRES_TRISTE' | 'TRISTE' | 'NEUTRE' | 'CONTENT' | 'TRES_HEUREUX';

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);

  // Scores de base par humeur
  private readonly MOOD_BASE = {
    TRES_TRISTE: 30,
    TRISTE: 20,
    NEUTRE: 10,
    CONTENT: 5,
    TRES_HEUREUX: 0,
  };

  // Catégories de risque avec poids et termes
  private readonly CATEGORIES = {
    A: {
      // Violence physique
      weight: 40,
      terms: [
        'frapper',
        'taper',
        'bousculer',
        'cogner',
        'claquer',
        'gifler',
        'pousser',
        'racket',
        'voler argent',
        'menacer de frapper',
        'blessure',
        'bleu',
        'saigner',
        'battre',
        'violence',
        'bagarre',
        'combat',
        'cogner',
        'frapper',
      ],
    },
    B: {
      // Menaces / intimidation
      weight: 35,
      terms: [
        'menacer',
        'menace',
        'si tu parles',
        'te battre',
        'te faire du mal',
        'te retrouver',
        'chantage',
        'intimider',
        'intimidation',
        'chantage',
      ],
    },
    C: {
      // Insultes / moqueries répétées
      weight: 25,
      terms: [
        'insulte',
        'traiter de',
        'se moquer',
        'moquerie',
        'humilier',
        'rabaisser',
        'harceler',
        'harcelement',
        'gros',
        'grosse',
        'moche',
        'nul',
        'nulle',
        'loser',
        'debile',
        'bouffon',
        'sale',
        'intello',
        'arabe',
        'noir',
        'juif',
        'pd',
        'pute',
        'insulter',
        'injure',
        'raillerie',
        'railler',
      ],
    },
    D: {
      // Exclusion sociale
      weight: 20,
      terms: [
        'exclure',
        'personne ne me parle',
        'a l ecart',
        'ignorer',
        'personne veut jouer',
        'seul',
        'seule',
        'isolement',
        'table a part',
        'groupe sans moi',
        'rejet',
        'rejeter',
        'ignoré',
      ],
    },
    E: {
      // Cyberharcèlement
      weight: 30,
      terms: [
        'groupe whatsapp',
        'snap',
        'tiktok',
        'insta',
        'dm',
        'spam',
        'stories',
        'publier ma photo',
        'video de moi',
        'creer faux compte',
        'insulte en ligne',
        'harcelement en ligne',
        'cyberharcelement',
      ],
    },
    F: {
      // Vol / rackette / dégradation
      weight: 25,
      terms: [
        'voler',
        'racket',
        'racketter',
        'prendre mon argent',
        'casser mes affaires',
        'cacher mes affaires',
        'vol',
        'dégradation',
      ],
    },
    G: {
      // Rumeurs / diffamation
      weight: 20,
      terms: [
        'rumeur',
        'ragot',
        'on dit que',
        'mentir sur moi',
        'reputation',
        'reput',
        'diffamation',
      ],
    },
    H: {
      // Détresse psychologique
      weight: 30,
      terms: [
        'peur d aller a l ecole',
        'angoisse',
        'crise',
        'pleurer',
        'cauchemar',
        'je veux pas y aller',
        'mal au ventre le matin',
        'anxieux',
        'anxiété',
        'stress',
        'stressé',
        'déprimé',
        'dépression',
      ],
    },
    I: {
      // Auto-dévalorisation / idées noires
      weight: 45,
      terms: [
        'je me hais',
        'je vaux rien',
        'envie de disparaitre',
        'je veux mourir',
        'plus envie de vivre',
        'scarification',
        'me faire du mal',
        'suicide',
        'se suicider',
        'mourir',
        'automutilation',
      ],
    },
  };

  // Intensificateurs
  private readonly intensifiers = [
    'toujours',
    'tout le temps',
    'encore',
    'souvent',
    'chaque jour',
    'tous les jours',
    'depuis des semaines',
    'très',
    'vraiment',
    'trop',
    'énormément',
    'beaucoup',
    'sans arrêt',
  ];

  // Termes temporels (fraîcheur)
  private readonly temporalTerms = [
    'aujourd hui',
    'ce matin',
    'a la recre',
    'maintenant',
    'tout a l heure',
  ];

  // Lieux scolaires
  private readonly schoolPlaces = [
    'classe',
    'cour',
    'couloir',
    'bus scolaire',
    'cantine',
    'casier',
    'école',
  ];

  // Pluralité d'agresseurs
  private readonly pluralityTerms = [
    'ils',
    'elles',
    'plusieurs',
    'groupe',
    'bande',
    'tous',
    'toutes',
  ];

  // Négations protectrices
  private readonly negations = ['pas', 'ne pas', 'jamais', 'rien', 'aucun', 'personne', 'non'];

  /**
   * Analyse le texte et l'humeur pour déterminer le niveau de risque
   */
  analyzeRisk(
    contentText: string,
    mood: string,
    recurrenceData: RecurrenceData[] = [],
  ): AIAnalysisResult {
    this.logger.log(`Analyzing content for mood: ${mood}`);

    const normalizedText = this.normalizeText(contentText);
    const moodTyped = mood as Mood;

    // Score de base selon l'humeur
    let score = this.MOOD_BASE[moodTyped];

    // Analyse par catégories
    const catScores: Record<string, number> = {};
    const catCounts: Record<string, number> = {};

    for (const [cat, def] of Object.entries(this.CATEGORIES)) {
      let catScore = 0;
      let count = 0;

      for (const term of def.terms) {
        const hits = this.countOccurrences(normalizedText, term);
        if (hits > 0) {
          // Multiplicateurs
          const intensifierMult = this.getIntensifierMultiplier(normalizedText, term);
          const pluralityMult = this.getPluralityMultiplier(normalizedText, term);
          const negationMult = this.getNegationMultiplier(normalizedText, term);

          // Limiter à 3 occurrences max par terme
          const limitedHits = Math.min(hits, 3);
          const finalMult = intensifierMult * pluralityMult * negationMult;

          catScore += limitedHits * def.weight * finalMult;
          count += hits;
        }
      }

      if (catScore > 0) {
        catScores[cat] = catScore;
        catCounts[cat] = count;
        score += catScore;
      }
    }

    // Bonus temporels et géographiques
    if (this.hasTemporalTerms(normalizedText)) score += 5;
    if (this.hasSchoolPlaces(normalizedText)) score += 5;

    // Bonus de récurrence
    const recurrenceBonus = this.calculateRecurrenceBonus(recurrenceData);
    score += recurrenceBonus;

    // Planchers de sécurité
    if (catScores['I']) {
      score = Math.max(score, 70); // Min ELEVE pour idées noires
    }
    if (
      (catScores['A'] || catScores['B']) &&
      (moodTyped === 'TRISTE' || moodTyped === 'TRES_TRISTE')
    ) {
      score = Math.max(score, 65); // Min ELEVE pour violence + humeur triste
    }

    // Cap à 100
    score = Math.min(100, Math.round(score));

    // Détermination du niveau de risque
    const riskLevel = this.determineRiskLevel(score);
    const dominantCategory = this.getDominantCategory(catScores);

    // Génération du résumé et conseil
    const summary = this.buildSummary(dominantCategory, normalizedText, catScores);
    const advice = this.buildAdvice(dominantCategory);

    this.logger.log(
      `Analysis complete: score=${score}, level=${riskLevel}, dominant=${dominantCategory}`,
    );

    return {
      riskScore: score,
      riskLevel,
      summary,
      advice,
      dominantCategory,
    };
  }

  /**
   * Normalise le texte pour l'analyse
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^\w\s']/g, ' ') // Remplace la ponctuation par des espaces (garde apostrophes)
      .replace(/\s+/g, ' ') // Normalise les espaces
      .trim();
  }

  /**
   * Compte les occurrences d'un terme dans le texte
   */
  private countOccurrences(text: string, term: string): number {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Vérifie les intensificateurs autour d'un terme
   */
  private getIntensifierMultiplier(text: string, term: string): number {
    const termIndex = text.indexOf(term.toLowerCase());
    if (termIndex === -1) return 1;

    // Contexte avant et après le terme
    const context = text.substring(
      Math.max(0, termIndex - 50),
      Math.min(text.length, termIndex + term.length + 50),
    );

    for (const intensifier of this.intensifiers) {
      if (context.includes(intensifier)) {
        return 1.2; // Multiplicateur d'intensification
      }
    }

    return 1;
  }

  /**
   * Vérifie la pluralité d'agresseurs
   */
  private getPluralityMultiplier(text: string, term: string): number {
    const termIndex = text.indexOf(term.toLowerCase());
    if (termIndex === -1) return 1;

    const context = text.substring(
      Math.max(0, termIndex - 30),
      Math.min(text.length, termIndex + term.length + 30),
    );

    for (const pluralityTerm of this.pluralityTerms) {
      if (context.includes(pluralityTerm)) {
        return 1.15; // Multiplicateur de pluralité
      }
    }

    return 1;
  }

  /**
   * Vérifie les négations protectrices
   */
  private getNegationMultiplier(text: string, term: string): number {
    const termIndex = text.indexOf(term.toLowerCase());
    if (termIndex === -1) return 1;

    // Contexte avant le terme (3 mots)
    const context = text.substring(Math.max(0, termIndex - 30), termIndex);

    for (const negation of this.negations) {
      if (context.includes(negation)) {
        return 0.3; // Réduction significative pour négation
      }
    }

    return 1;
  }

  /**
   * Vérifie la présence de termes temporels
   */
  private hasTemporalTerms(text: string): boolean {
    return this.temporalTerms.some((term) => text.includes(term));
  }

  /**
   * Vérifie la présence de lieux scolaires
   */
  private hasSchoolPlaces(text: string): boolean {
    return this.schoolPlaces.some((place) => text.includes(place));
  }

  /**
   * Calcule le bonus de récurrence
   */
  private calculateRecurrenceBonus(recurrenceData: RecurrenceData[]): number {
    const categoryDays: Record<string, number> = {};

    // Compter les jours par catégorie
    for (const data of recurrenceData) {
      if (!categoryDays[data.category]) {
        categoryDays[data.category] = 0;
      }
      categoryDays[data.category] += data.days;
    }

    let bonus = 0;
    for (const days of Object.values(categoryDays)) {
      if (days >= 5) {
        bonus += 20;
      } else if (days >= 3) {
        bonus += 10;
      }
    }

    return bonus;
  }

  /**
   * Détermine le niveau de risque selon le score
   */
  private determineRiskLevel(score: number): 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE' {
    if (score < 40) return 'FAIBLE';
    if (score < 65) return 'MOYEN';
    if (score < 85) return 'ELEVE';
    return 'CRITIQUE';
  }

  /**
   * Trouve la catégorie dominante
   */
  private getDominantCategory(catScores: Record<string, number>): string {
    let maxScore = 0;
    let dominant = '';

    for (const [cat, score] of Object.entries(catScores)) {
      if (score > maxScore) {
        maxScore = score;
        dominant = cat;
      }
    }

    return dominant;
  }

  /**
   * Construit le résumé basé sur la catégorie dominante
   */
  private buildSummary(
    dominantCategory: string,
    text: string,
    _catScores: Record<string, number>,
  ): string {
    const categoryNames = {
      A: 'violence physique',
      B: 'menaces et intimidation',
      C: 'insultes et moqueries',
      D: 'exclusion sociale',
      E: 'cyberharcèlement',
      F: 'racket et vol',
      G: 'rumeurs et diffamation',
      H: 'détresse psychologique',
      I: 'idées noires et auto-dévalorisation',
    };

    if (!dominantCategory) {
      return 'Aucun signe de détresse détecté.';
    }

    const context = this.getContextFromText(text);
    const categoryName = categoryNames[dominantCategory] || 'problème détecté';

    return `${categoryName}${context}.`;
  }

  /**
   * Extrait le contexte du texte
   */
  private getContextFromText(text: string): string {
    const contexts = [];

    if (text.includes('classe') || text.includes('cour')) {
      contexts.push('en classe');
    }
    if (text.includes('whatsapp') || text.includes('snap') || text.includes('en ligne')) {
      contexts.push('sur les réseaux sociaux');
    }
    if (text.includes('groupe') || text.includes('bande')) {
      contexts.push('en groupe');
    }

    return contexts.length > 0 ? ` ${contexts.join(' et ')}` : '';
  }

  /**
   * Construit le conseil basé sur la catégorie dominante
   */
  private buildAdvice(dominantCategory: string): string {
    const adviceMap = {
      A: "Contacter rapidement l'élève (même jour), sécuriser les temps sensibles (récré/bus), informer la vie scolaire, évaluer la sécurité.",
      B: 'Entretien discret, sécuriser la sortie et les trajets, garder des traces, proposer un point avec le référent.',
      C: 'Rencontre élève sous 48h, rappel du cadre de vie de classe, surveillance ciblée, médiation si possible.',
      D: "Vérifier dynamique de groupe, proposer binôme de soutien, activités d'inclusion, suivi hebdo.",
      E: 'Collecter captures, signaler sur la plateforme, informer les familles, sensibilisation au groupe classe.',
      F: 'Entretien protégé, sécuriser effets personnels, surveillance lieux à risque, procédure disciplinaire si avéré.',
      G: 'Recueillir les faits calmement, identifier initiateurs, rétablir les faits, suivi de classe.',
      H: 'Rendez-vous rapide avec CPE/AS, orientation vers infirmière/psychologue scolaire, plan de soutien.',
      I: "Priorité absolue : évaluation du risque, informer le chef d'établissement, contacter responsable légal si nécessaire, accompagner vers soins.",
    };

    return adviceMap[dominantCategory] || 'Surveillance renforcée recommandée.';
  }
}
