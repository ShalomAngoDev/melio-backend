/**
 * Utilitaires pour le seeding des données
 */

/**
 * Supprime les accents d'une chaîne de caractères
 * @param {string} str - Chaîne à nettoyer
 * @returns {string} - Chaîne sans accents
 */
function removeAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-zA-Z0-9]/g, '') // Supprime tout sauf lettres et chiffres
    .toLowerCase();
}

/**
 * Génère un email propre sans accents
 * @param {string} schoolName - Nom de l'école
 * @param {string} prefix - Préfixe (agent, admin, etc.)
 * @param {number} index - Index pour l'unicité
 * @returns {string} - Email nettoyé
 */
function generateCleanEmail(schoolName, prefix, index) {
  const cleanName = removeAccents(schoolName);
  return `${prefix}${index}@${cleanName}.fr`;
}

/**
 * Génère un code d'école propre sans accents
 * @param {string} schoolName - Nom de l'école
 * @param {number} index - Index pour l'unicité
 * @returns {string} - Code nettoyé
 */
function generateCleanSchoolCode(schoolName, index) {
  const cleanName = removeAccents(schoolName);
  const paddedIndex = String(index).padStart(3, '0');
  return `SCHOOL${paddedIndex}`;
}

module.exports = {
  removeAccents,
  generateCleanEmail,
  generateCleanSchoolCode
};


