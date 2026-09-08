import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from 'prisma/prisma.module';

@Global()
@Module({
  providers: [AuditService],
  imports: [PrismaModule],
})
export class AuditModule {}
