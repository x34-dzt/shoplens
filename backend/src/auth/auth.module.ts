import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>): JwtModuleOptions => ({
        secret: config.secret,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
