import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/role.enum';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('photo')
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Uploader une photo pour une entrée de journal' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Photo uploadée avec succès',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL de la photo uploadée' },
        filename: { type: 'string', description: 'Nom du fichier' },
        size: { type: 'number', description: 'Taille du fichier en bytes' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Fichier invalide' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Vérifier le type de fichier
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Type de fichier non supporté. Utilisez JPEG, PNG ou WebP.');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Fichier trop volumineux. Taille maximale: 5MB');
    }

    try {
      const result = await this.uploadService.uploadPhoto(file, req.user.sub);
      return {
        url: result.url,
        filename: result.filename,
        size: file.size,
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'upload: ${error.message}`);
    }
  }
}
