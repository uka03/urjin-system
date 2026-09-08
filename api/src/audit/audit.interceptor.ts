import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly entityName: string,
    private readonly action: AuditAction,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, ip, headers, body } = request;

    return next.handle().pipe(
      tap((responseData) => {
        this.auditService.log({
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip || headers['x-forwarded-for'],
          userAgent: headers['user-agent'],
          action: this.action,
          entity: this.entityName,
          entityId: responseData?.id || request.params?.id,
          newValues: ['POST', 'PUT', 'PATCH'].includes(request.method)
            ? body
            : undefined,
          metadata: {
            url: request.url,
            method: request.method,
          },
        });
      }),
    );
  }
}
