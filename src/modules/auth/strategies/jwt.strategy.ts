import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../config/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Check if token is blacklisted
    const isBlacklisted = await this.redis.get(`blacklist:${payload.sub}`);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token révoqué');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
      schoolCode: payload.schoolCode,
    };
  }
}
