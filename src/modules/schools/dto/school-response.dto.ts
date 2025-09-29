import { ApiProperty } from '@nestjs/swagger';

export class SchoolResponseDto {
  @ApiProperty({ description: 'ID unique de l\'établissement' })
  id: string;

  @ApiProperty({ description: 'Code d\'établissement (8 caractères)' })
  code: string;

  @ApiProperty({ description: 'Nom officiel' })
  name: string;

  @ApiProperty({ description: 'Adresse principale' })
  address1: string;

  @ApiProperty({ description: 'Adresse complémentaire', required: false })
  address2?: string;

  @ApiProperty({ description: 'Code postal' })
  postalCode: string;

  @ApiProperty({ description: 'Ville' })
  city: string;

  @ApiProperty({ description: 'Pays' })
  country: string;

  @ApiProperty({ description: 'Fuseau horaire' })
  timezone: string;

  @ApiProperty({ description: 'Niveau d\'enseignement', required: false })
  level?: string;

  @ApiProperty({ description: 'Code UAI', required: false })
  uaiCode?: string;

  @ApiProperty({ description: 'Nom du contact principal', required: false })
  contactName?: string;

  @ApiProperty({ description: 'Email du contact principal', required: false })
  contactEmail?: string;

  @ApiProperty({ description: 'Téléphone du contact principal', required: false })
  contactPhone?: string;

  @ApiProperty({ description: 'Paramètres de l\'établissement', required: false })
  settings?: any;

  @ApiProperty({ description: 'Statut de l\'établissement' })
  status: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: string;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  updatedAt: string;
}


