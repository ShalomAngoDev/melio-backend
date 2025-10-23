import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  async uploadPhoto(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ url: string; filename: string }> {
    try {
      // Générer un nom de fichier unique
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const filename = `photos/${userId}/${uuidv4()}.${fileExtension}`;

      // Pour le moment, on retourne l'URL directement
      // Dans un vrai projet, vous feriez l'upload vers votre service de stockage en ligne ici
      const url = `https://your-image-storage.com/${filename}`;

      this.logger.log(`Photo URL générée: ${url} pour l'utilisateur ${userId}`);

      return {
        url,
        filename,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la génération de l'URL de photo: ${error.message}`);
      throw error;
    }
  }

  async deletePhoto(filename: string): Promise<void> {
    try {
      // Dans un vrai projet, vous feriez la suppression de l'image de votre service de stockage ici
      this.logger.log(`Photo supprimée: ${filename}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de photo: ${error.message}`);
      throw error;
    }
  }
}
