import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid login credentials.');
    }

    // Update last login timestamp
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokens(user.id, user.email);

    // Save refresh token to database
    const refreshExpiresInSeconds = this.parseExpirationToSeconds(
      this.configService.get<string>('jwt.refreshExpiration') || '604800s',
    );
    const expiresAt = new Date(Date.now() + refreshExpiresInSeconds * 1000);
    await this.refreshTokenRepository.create(user.id, tokens.refreshToken, expiresAt);

    const { passwordHash, ...userProfile } = user;

    return {
      ...tokens,
      user: userProfile,
    };
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findByToken(refreshToken);
    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh session.');
    }

    const user = tokenRecord.user;
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User session suspended.');
    }

    // Revoke old token
    await this.refreshTokenRepository.revoke(refreshToken);

    const tokens = await this.generateTokens(user.id, user.email);

    // Save new refresh token
    const refreshExpiresInSeconds = this.parseExpirationToSeconds(
      this.configService.get<string>('jwt.refreshExpiration') || '604800s',
    );
    const expiresAt = new Date(Date.now() + refreshExpiresInSeconds * 1000);
    await this.refreshTokenRepository.create(user.id, tokens.refreshToken, expiresAt);

    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findByToken(refreshToken);
    if (tokenRecord) {
      await this.refreshTokenRepository.revoke(refreshToken);
    }
    return { message: 'Logged out successfully.' };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Profile session expired.');
    }
    const { passwordHash, ...rest } = user;
    return rest;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { email, sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: (this.configService.get<string>('jwt.expiration') || '3600s') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: (this.configService.get<string>('jwt.refreshExpiration') || '604800s') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private parseExpirationToSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const val = parseInt(expiration.slice(0, -1), 10);
    switch (unit) {
      case 's': return val;
      case 'm': return val * 60;
      case 'h': return val * 3600;
      case 'd': return val * 86400;
      default: return val;
    }
  }
}
