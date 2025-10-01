import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from '../../config/minio.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly minioService: MinioService) {}

  async uploadPhoto(file: Express.Multer.File, userId: string): Promise<{ url: string; filename: string }> {
    try {
      // Générer un nom de fichier unique
      const fileExtension = file.originalname.split('.').pop() || 'jpg';
      const filename = `photos/${userId}/${uuidv4()}.${fileExtension}`;

      // Upload vers MinIO
      await this.minioService.uploadFile(filename, file.buffer, file.mimetype);

      // Construire l'URL publique
      const url = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/melio/${filename}`;

      this.logger.log(`Photo uploadée: ${filename} pour l'utilisateur ${userId}`);

      return {
        url,
        filename,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de l'upload de photo: ${error.message}`);
      throw error;
    }
  }

  async deletePhoto(filename: string): Promise<void> {
    try {
      await this.minioService.deleteFile(filename);
      this.logger.log(`Photo supprimée: ${filename}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de photo: ${error.message}`);
      throw error;
    }
  }
}
