import {
  Controller,
  Get,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { StoreRepository } from '../store/store.repository';
import { JwtGuard } from '../auth/guards/jwt.guard';
import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly storeRepository: StoreRepository,
  ) {}

  private async getStoreId(req: ExpressRequest): Promise<string> {
    const user = req['user'] as JwtPayload;
    const store = await this.storeRepository.findByUserId(user.sub);
    if (!store) {
      throw new NotFoundException('No store found for user');
    }
    return store.id;
  }

  @Get('overview')
  async getOverview(@Request() req: ExpressRequest) {
    const storeId = await this.getStoreId(req);
    return this.analyticsService.getOverview(storeId);
  }

  @Get('top-products')
  async getTopProducts(@Request() req: ExpressRequest) {
    const storeId = await this.getStoreId(req);
    return this.analyticsService.getTopProducts(storeId);
  }

  @Get('recent-activity')
  async getRecentActivity(@Request() req: ExpressRequest) {
    const storeId = await this.getStoreId(req);
    return this.analyticsService.getRecentActivity(storeId);
  }
}
