import {
  Inject,
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DRIZZLE, type DrizzleDB } from '../database/database.module';
import { userTable } from '../database/schema';
import { StoreRepository } from '../store/store.repository';
import { eq } from 'drizzle-orm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly storeRepository: StoreRepository,
    private readonly jwtService: JwtService,
  ) {}

  private async findByUsername(username: string) {
    const rows = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1);
    return rows[0] ?? null;
  }

  private async createUser(username: string, hashedPassword: string) {
    const rows = await this.db
      .insert(userTable)
      .values({ username, password: hashedPassword })
      .returning();
    return rows[0];
  }

  async register(dto: RegisterDto) {
    const existing = await this.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.createUser(dto.username, hashedPassword);

    const store = await this.storeRepository.create(
      `${dto.username}'s Store`,
      user.id,
    );

    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });
    return { token, storeId: store.id };
  }

  async login(dto: LoginDto) {
    const user = await this.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const store = await this.storeRepository.findByUserId(user.id);
    if (!store) {
      throw new NotFoundException('No store found for user');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });
    return { token, storeId: store.id };
  }
}
