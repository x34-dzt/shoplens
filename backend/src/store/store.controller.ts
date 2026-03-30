import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StoreRepository } from './store.repository';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import type { Request as ExpressRequest } from 'express';

@Controller('stores')
@UseGuards(JwtGuard)
export class StoreController {
  constructor(private readonly storeRepository: StoreRepository) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateStoreDto, @Request() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    return this.storeRepository.create(dto.name, user.sub);
  }
}
