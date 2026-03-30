import { BadRequestException, Injectable } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { EventTypeEnum } from '../database/schema';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventsRepository) {}

  async ingest(
    storeId: string,
    createEventDto: CreateEventDto,
  ): Promise<{ success: boolean }> {
    this.validateEventData(createEventDto);
    await this.eventRepository.ingestEvent(storeId, createEventDto);
    return { success: true };
  }

  private validateEventData(dto: CreateEventDto): void {
    if (dto.eventType === EventTypeEnum.purchase) {
      if (!dto.data.amount || typeof dto.data.amount !== 'number') {
        throw new BadRequestException(
          'Purchase events require a numeric amount in data',
        );
      }
      if (!dto.data.productId || typeof dto.data.productId !== 'string') {
        throw new BadRequestException(
          'Purchase events require a productId in data',
        );
      }
    }
  }
}
