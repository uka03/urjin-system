import { AuditAction } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAuditDto {
  @IsOptional()
  @IsString()
  userId?: string;
  @IsOptional()
  @IsString()
  userEmail?: string;
  @IsOptional()
  @IsString()
  ipAddress?: string;
  @IsOptional()
  @IsString()
  userAgent?: string;
  @IsEnum(AuditAction)
  action!: AuditAction;
  @IsOptional()
  entity!: string;
  @IsOptional()
  @IsString()
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}
