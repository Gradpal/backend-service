import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsArray,
  IsUUID,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class BadgeResponseDto {
  @IsUUID()
  @ApiProperty({
    description: 'Unique ID of the badge',
    example: '9f1c8e40-1d2a-4a2f-8a2b-1e4f3d5a6b7c',
  })
  id: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID of the student who earned the badge',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  studentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Title of the badge', example: 'Math Whiz' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Description of the badge',
    example: 'Awarded for scoring above 90% in Mathematics final exam.',
  })
  description: string;

  @IsDateString()
  @ApiProperty({
    description: 'Date the badge was issued',
    example: '2025-07-10',
  })
  issuedDate: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'URL or path to badge icon/image',
    example: 'uploads/badges/math-whiz.png',
    required: false,
  })
  iconUrl?: string;
}

export class CertificateResponseDTO {
  @IsUUID()
  @ApiProperty({
    description: 'Unique ID of the certificate',
    example: 'a3f1e9d2-7c8b-4d95-b7e1-62f9e3c7a4e1',
  })
  id: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID of the student who earned the certificate',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  studentId: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID of the teacher who issued the certificate',
    example: 'e7d7a8c9-1a3b-4c4d-9c8b-235d90b2c4f7',
  })
  teacherId: string;

  @IsUUID()
  @ApiProperty({
    description: 'ID of the subject related to the certificate',
    example: '9b2e13c7-7f3b-4f27-8b2d-88a13e5f1d2a',
  })
  subjectId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Title of the certificate',
    example: 'Mathematical Fundamentals',
  })
  title: string;

  @IsDateString()
  @ApiProperty({
    description: 'Date the certificate was issued',
    example: '2025-04-10',
  })
  issuedDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'URL or path to certificate file',
    example: 'uploads/mathematical-fundamentals.pdf',
  })
  url: string;
}

export class AchievementSummaryResponseDTO {
  @IsInt()
  @ApiProperty({ description: 'Total number of certificates', example: 5 })
  certificatesTotal: number;

  @IsInt()
  @ApiProperty({ description: 'Total number of badges earned', example: 3 })
  badges: number;

  @IsInt()
  @ApiProperty({ description: 'Total points accumulated', example: 1500 })
  points: number;

  @IsInt()
  @ApiProperty({ description: 'Number of level-ups achieved', example: 4 })
  levelsUps: number;

  @IsArray()
  @ApiProperty({
    description: 'List of certificates',
    type: [CertificateResponseDTO],
  })
  certificates: CertificateResponseDTO[];

  @IsArray()
  @ApiProperty({ description: 'List of badges', type: [BadgeResponseDto] })
  badgesList: BadgeResponseDto[];
}
