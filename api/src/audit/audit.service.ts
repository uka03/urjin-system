import { Injectable } from '@nestjs/common';
import { CreateAuditDto } from './dto/create-audit.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditDto) {
    try {
      return await this.prisma.auditEvent.create({
        data: dto,
      });
    } catch (error) {
      // Аудит бичихэд алдаа гарвал үндсэн бизнесийн процессийг унагаахгүй байхаар зохицуулна
      console.error('Failed to save audit log:', error);
    }
  }
}
