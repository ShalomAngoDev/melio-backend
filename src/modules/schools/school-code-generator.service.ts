import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SchoolCodeGeneratorService {
  private readonly logger = new Logger(SchoolCodeGeneratorService.name);

  // Mots à ignorer au début du nom d'établissement
  private readonly STOPWORDS = [
    'ECOLE',
    'COLLEGE',
    'LYCEE',
    'INSTITUT',
    'INSTITUTION',
    'GROUPE',
    'GROUPEMENT',
    'SAINT',
    'SAINTE',
    'ST',
    'STE',
    'NOTRE',
    'LE',
    'LA',
    'LES',
    'L',
    'DE',
    'DU',
    'DES',
    'D',
  ];

  /**
   * Génère un code d'établissement humain et mémorisable
   * @param name Nom de l'établissement
   * @param postalCode Code postal
   * @returns Code de 5 caractères (3 lettres + 2 chiffres) ou avec suffixe en cas de collision
   */
  generateSchoolCode(name: string, postalCode: string): string {
    // 1. Normaliser le nom
    const normalizedName = this.normalizeName(name);

    // 2. Extraire les mots utiles (sans stopwords)
    const usefulWords = this.extractUsefulWords(normalizedName);

    // 3. Générer les 3 lettres
    const letters = this.generateLetters(usefulWords);

    // 4. Extraire les 2 chiffres du code postal
    const digits = this.extractPostalDigits(postalCode);

    // 5. Code de base
    const baseCode = letters + digits;

    this.logger.debug(`Generated school code: ${baseCode} for "${name}"`);

    return baseCode;
  }

  /**
   * Génère un code avec gestion des collisions
   * @param name Nom de l'établissement
   * @param postalCode Code postal
   * @param existingCodes Liste des codes existants
   * @returns Code unique de 5 caractères ou avec suffixe
   */
  generateUniqueSchoolCode(name: string, postalCode: string, existingCodes: string[] = []): string {
    const baseCode = this.generateSchoolCode(name, postalCode);

    // Vérifier si le code de base est disponible
    if (!existingCodes.includes(baseCode)) {
      return baseCode;
    }

    // Gérer les collisions avec un suffixe
    let suffix = 1;
    let candidateCode = `${baseCode}-${String(suffix).padStart(2, '0')}`;

    while (existingCodes.includes(candidateCode) && suffix < 99) {
      suffix++;
      candidateCode = `${baseCode}-${String(suffix).padStart(2, '0')}`;
    }

    if (suffix >= 99) {
      throw new Error("Impossible de générer un code d'établissement unique après 99 tentatives");
    }

    return candidateCode;
  }

  /**
   * Valide un code d'établissement (format 3 lettres + 2 chiffres ou avec suffixe)
   */
  validateSchoolCode(schoolCode: string): boolean {
    // Format de base : 3 lettres + 2 chiffres
    const basePattern = /^[A-Z]{3}[0-9]{2}$/;

    // Format avec suffixe : 3 lettres + 2 chiffres + - + 2 chiffres
    const suffixPattern = /^[A-Z]{3}[0-9]{2}-[0-9]{2}$/;

    return basePattern.test(schoolCode) || suffixPattern.test(schoolCode);
  }

  /**
   * Normalise le nom de l'établissement
   */
  private normalizeName(name: string): string {
    return this.removeAccents(name.trim().toUpperCase())
      .replace(/[^A-Z\s]/g, '') // Garder seulement lettres et espaces
      .replace(/\s+/g, ' ') // Remplacer multiples espaces par un seul
      .trim();
  }

  /**
   * Supprime les accents d'une chaîne
   */
  private removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Extrait les mots utiles en supprimant les stopwords
   */
  private extractUsefulWords(normalizedName: string): string[] {
    const words = normalizedName.split(' ').filter((word) => word.length > 0);
    const usefulWords: string[] = [];

    for (const word of words) {
      if (!this.STOPWORDS.includes(word)) {
        usefulWords.push(word);
      }
    }

    return usefulWords;
  }

  /**
   * Génère les 3 lettres du code
   */
  private generateLetters(usefulWords: string[]): string {
    if (usefulWords.length === 0) {
      return 'XXX'; // Fallback si aucun mot utile
    }

    if (usefulWords.length === 1) {
      // Un seul mot : prendre les 3 premières lettres
      return usefulWords[0].substring(0, 3).padEnd(3, 'X');
    }

    if (usefulWords.length === 2) {
      // Deux mots : première lettre de chaque + deuxième lettre du deuxième mot
      const first = usefulWords[0][0];
      const second = usefulWords[1][0];
      const third = usefulWords[1].length > 1 ? usefulWords[1][1] : usefulWords[0][1] || 'X';
      return (first + second + third).padEnd(3, 'X');
    }

    // Trois mots ou plus : première lettre des trois premiers mots
    const letters = usefulWords
      .slice(0, 3)
      .map((word) => word[0])
      .join('');
    return letters.padEnd(3, 'X');
  }

  /**
   * Extrait les 2 premiers chiffres du code postal
   */
  private extractPostalDigits(postalCode: string): string {
    const digits = postalCode.replace(/\D/g, '');
    return digits.substring(0, 2).padEnd(2, '0');
  }
}
