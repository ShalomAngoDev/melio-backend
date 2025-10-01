import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class StudentIdGeneratorService {
  private readonly logger = new Logger(StudentIdGeneratorService.name);

  // Alphabet Base32 Crockford (sans I, L, O pour éviter les ambiguïtés)
  private readonly CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  /**
   * Génère un identifiant secret de 6 caractères pour un élève
   * @param schoolCode Code de l'établissement
   * @param lastName Nom de famille
   * @param firstName Prénom
   * @param birthdate Date de naissance (YYYY-MM-DD)
   * @param schoolIdKey Clé secrète de l'établissement
   * @param salt Salt optionnel pour gérer les collisions
   * @returns Identifiant de 6 caractères (5 + checksum)
   */
  generateStudentId(
    schoolCode: string,
    lastName: string,
    firstName: string,
    birthdate: string,
    schoolIdKey: string,
    salt: string = '',
  ): string {
    // 1. Canoniser les inputs
    const canonicalSchoolCode = this.canonicalize(schoolCode);
    const canonicalLastName = this.canonicalize(lastName);
    const canonicalFirstName = this.canonicalize(firstName);
    const canonicalBirthdate = this.formatBirthdate(birthdate);

    // 2. Concaténer avec séparateur
    const base = `${canonicalSchoolCode}|${canonicalLastName}|${canonicalFirstName}|${canonicalBirthdate}${salt}`;

    // 3. HMAC-SHA256 avec la clé secrète
    const hmac = crypto.createHmac('sha256', schoolIdKey);
    hmac.update(base);
    const digest = hmac.digest();

    // 4. Encodage Base32 Crockford
    const b32 = this.toCrockfordBase32(digest);

    // 5. Prendre les 5 premiers caractères
    const core = b32.slice(0, 5);

    // 6. Calculer le checksum (somme des bytes mod 32)
    const checksum = this.calculateChecksum(core);

    // 7. ID final (6 caractères)
    const uniqueId = core + checksum;

    // Log sécurisé (ne jamais logger la clé ou les données sensibles)
    this.logger.debug(`Generated student ID for school: ${canonicalSchoolCode}`);

    return uniqueId;
  }

  /**
   * Canonise une chaîne : suppression des accents, majuscules, trim
   */
  private canonicalize(input: string): string {
    return this.removeAccents(input.trim().toUpperCase());
  }

  /**
   * Supprime les accents d'une chaîne
   */
  private removeAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Formate la date de naissance en YYYYMMDD
   */
  private formatBirthdate(birthdate: string): string {
    const date = new Date(birthdate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Encode un buffer en Base32 Crockford
   */
  private toCrockfordBase32(buffer: Buffer): string {
    let result = '';
    let bits = 0;
    let value = 0;

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        result += this.CROCKFORD_ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      result += this.CROCKFORD_ALPHABET[(value << (5 - bits)) & 31];
    }

    return result;
  }

  /**
   * Calcule le checksum pour les 5 caractères du core
   */
  private calculateChecksum(core: string): string {
    let sum = 0;
    for (let i = 0; i < core.length; i++) {
      sum += core.charCodeAt(i);
    }
    return this.CROCKFORD_ALPHABET[sum % 32];
  }

  /**
   * Génère un identifiant avec gestion des collisions
   * @param schoolCode Code de l'établissement
   * @param lastName Nom de famille
   * @param firstName Prénom
   * @param birthdate Date de naissance
   * @param schoolIdKey Clé secrète de l'établissement
   * @param existingIds Liste des IDs existants pour éviter les collisions
   * @returns Identifiant unique de 6 caractères
   */
  generateUniqueStudentId(
    schoolCode: string,
    lastName: string,
    firstName: string,
    birthdate: string,
    schoolIdKey: string,
    existingIds: string[] = [],
  ): string {
    let salt = '';
    let attempts = 0;
    const maxAttempts = 100; // Limite de sécurité

    while (attempts < maxAttempts) {
      const candidateId = this.generateStudentId(
        schoolCode,
        lastName,
        firstName,
        birthdate,
        schoolIdKey,
        salt,
      );

      if (!existingIds.includes(candidateId)) {
        return candidateId;
      }

      // Incrémenter le salt pour la prochaine tentative
      salt = `|#${attempts + 1}`;
      attempts++;
    }

    // Si on arrive ici, c'est qu'on a dépassé la limite
    throw new Error('Impossible de générer un identifiant unique après 100 tentatives');
  }

  /**
   * Valide un identifiant d'élève (vérifie le checksum)
   */
  validateStudentId(uniqueId: string): boolean {
    if (uniqueId.length !== 6) {
      return false;
    }

    const core = uniqueId.slice(0, 5);
    const checksum = uniqueId.slice(5, 6);
    const expectedChecksum = this.calculateChecksum(core);

    return checksum === expectedChecksum;
  }
}





