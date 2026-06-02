import { Module, Global } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacGuard } from './guards/rbac.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenRepository,
    JwtStrategy,
    JwtAuthGuard,
    RbacGuard,
  ],
  exports: [
    AuthService,
    RefreshTokenRepository,
    PassportModule,
    JwtModule,
    JwtAuthGuard,
    RbacGuard,
  ],
})
export class AuthModule {}
