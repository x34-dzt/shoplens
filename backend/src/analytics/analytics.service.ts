import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getOverview(storeId: string) {
    return this.analyticsRepository.getOverview(storeId);
  }

  async getTopProducts(storeId: string) {
    return this.analyticsRepository.getTopProducts(storeId);
  }

  async getRecentActivity(storeId: string) {
    return this.analyticsRepository.getRecentActivity(storeId);
  }
}
