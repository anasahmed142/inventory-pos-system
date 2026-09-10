// apps/server/src/modules/auth/guards/jwt-tenant.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTenantGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantHeader = request.headers['x-tenant-id'];
    const authHeader = request.headers['authorization'];

    let tenantId = tenantHeader;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        try {
          const decoded = this.jwtService.verify(token);
          tenantId = decoded.tenantId;
          request.user = decoded;
        } catch {}
      }
    }

    if (!tenantId) {
      throw new UnauthorizedException('Tenant context (X-Tenant-ID) required');
    }

    request.tenantId = tenantId;
    return true;
  }
}